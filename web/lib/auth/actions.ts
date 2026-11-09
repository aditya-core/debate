"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  ADULT_AGE,
  MIN_AGE,
  ageFrom,
  passwordsMatch,
} from "@/lib/auth/validation";

export type AuthState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export const INITIAL_STATE: AuthState = { status: "idle" };

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Please tell us your name.")
      .max(80, "That name is too long."),
    email: z.string().trim().toLowerCase().email("That email doesn't look right."),
    password: z
      .string()
      .min(10, "Use at least 10 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Type your password once more."),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter your date of birth."),
    guardianEmail: z.string().trim().toLowerCase().optional(),
    acceptedTerms: z.literal("on", {
      message: "Please accept the terms to continue.",
    }),
  })
  .superRefine((value, ctx) => {
    if (!passwordsMatch(value.password, value.confirmPassword)) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Those passwords don't match.",
      });
    }

    const age = ageFrom(value.dateOfBirth);
    if (age === null) {
      ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "That date isn't valid." });
      return;
    }
    if (age < MIN_AGE) {
      ctx.addIssue({
        code: "custom",
        path: ["dateOfBirth"],
        message: `Gift of Words is for ages ${MIN_AGE} and up.`,
      });
    }
    if (age > 100) {
      ctx.addIssue({ code: "custom", path: ["dateOfBirth"], message: "That date isn't valid." });
    }
    if (age < ADULT_AGE) {
      if (!value.guardianEmail) {
        ctx.addIssue({
          code: "custom",
          path: ["guardianEmail"],
          message: "A parent or guardian's email is required under 18.",
        });
        return;
      }
      const g = z.string().email().safeParse(value.guardianEmail);
      if (!g.success) {
        ctx.addIssue({
          code: "custom",
          path: ["guardianEmail"],
          message: "That guardian email doesn't look right.",
        });
      } else if (value.guardianEmail === value.email) {
        ctx.addIssue({
          code: "custom",
          path: ["guardianEmail"],
          message: "Use a different address from your own.",
        });
      }
    }
  });

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Registration isn't switched on in this environment yet. The database connection hasn't been configured.",
    };
  }

  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    guardianEmail: String(formData.get("guardianEmail") ?? "") || undefined,
    acceptedTerms: String(formData.get("acceptedTerms") ?? ""),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { fullName, email, password, dateOfBirth, guardianEmail } = parsed.data;
  const age = ageFrom(dateOfBirth) ?? 0;
  const requiresGuardian = age < ADULT_AGE;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await origin()}/auth/callback`,
      // Picked up by the `on_auth_user_created` trigger, which creates the
      // account, both world profiles and any guardian-consent record in one
      // transaction. See supabase/migrations/0001_identity.sql
      data: {
        full_name: fullName,
        date_of_birth: dateOfBirth,
        guardian_email: guardianEmail ?? null,
        requires_guardian_consent: requiresGuardian,
        notice_version: "2026-11-09",
        country: "IN",
      },
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already registered") || message.includes("already exists")) {
      return {
        status: "error",
        message: "That email is already registered. Try signing in instead.",
      };
    }
    if (error.status === 429) {
      return {
        status: "error",
        message: "Too many attempts. Give it a minute and try again.",
      };
    }
    return {
      status: "error",
      message: "We couldn't create your account. Please try again.",
    };
  }

  redirect(`/signup/check-email?email=${encodeURIComponent(email)}&guardian=${requiresGuardian ? "1" : "0"}`);
}

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("That email doesn't look right."),
  password: z.string().min(1, "Enter your password."),
});

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Sign-in isn't switched on in this environment yet. The database connection hasn't been configured.",
    };
  }

  const parsed = signInSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: { email: "Check your email and password." },
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Never reveal whether the address exists.
    return {
      status: "error",
      message: "Those details don't match an account.",
    };
  }

  redirect("/account");
}
