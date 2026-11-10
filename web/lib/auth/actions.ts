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

  // Honeypot: a field no human can see. Anything in it means a bot filled the
  // form, so we return the same destination a real sign-up gets and create
  // nothing. Silent by design — telling a bot it failed just teaches it.
  if (String(formData.get("company") ?? "").trim() !== "") {
    redirect("/signup/check-email");
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
      // Deliberate: the same destination a new sign-up gets. A different
      // response here would turn the form into an oracle for "does this person
      // have an account?", which is exactly what nobody wants on a platform
      // holding minors' data.
      redirect(`/signup/check-email?email=${encodeURIComponent(email)}`);
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

/* ------------------------------------------------------------------------- */
/* Password recovery                                                          */
/* ------------------------------------------------------------------------- */

const emailOnlySchema = z.object({
  email: z.string().trim().toLowerCase().email("That email doesn't look right."),
});

/**
 * Always answers the same way, whether or not the address has an account.
 * A recovery form that says "no account with that email" is the same oracle as
 * a signup form that says "already registered" — see D-065.
 */
export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Password recovery isn't switched on in this environment yet. The database connection hasn't been configured.",
    };
  }

  const parsed = emailOnlySchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: { email: "That email doesn't look right." } };
  }

  const supabase = await createServerSupabase();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await origin()}/auth/callback?next=/account/update-password`,
  });

  // Deliberately ignores the result: an error here is almost always "no such
  // user", and telling the visitor that is telling an attacker too.
  return {
    status: "success",
    message: "If that address has an account, a reset link is on its way.",
  };
}

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Use at least 10 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Type your password once more."),
  })
  .refine((v) => passwordsMatch(v.password, v.confirmPassword), {
    path: ["confirmPassword"],
    message: "Those passwords don't match.",
  });

export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Password changes aren't switched on in this environment yet. The database connection hasn't been configured.",
    };
  }

  const parsed = newPasswordSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A recovery link gets you here with a session. No session, no password.
  if (!user) {
    return {
      status: "error",
      message: "That reset link has expired. Ask for a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("same") || message.includes("different")) {
      return {
        status: "error",
        message: "Choose a password you haven't used here before.",
      };
    }
    return { status: "error", message: "We couldn't change it. Try again." };
  }

  redirect("/account?password=changed");
}
