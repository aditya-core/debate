/**
 * Tests for the rules that decide whether someone may register.
 *
 * Run with `npm test`. The age rule is legally load-bearing (DPDP parental
 * consent under 18), so it is pinned to a fixed "today" rather than whatever
 * date the machine happens to hold.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  ADULT_AGE,
  MIN_AGE,
  ageFrom,
  passwordScore,
} from "../lib/auth/validation.ts";

const NOW = new Date("2026-11-09T12:00:00Z");

test("age boundaries are exactly the birthday", () => {
  assert.equal(ADULT_AGE, 18);
  assert.equal(MIN_AGE, 13);

  assert.equal(ageFrom("2008-11-09", NOW), 18, "18th birthday counts as adult");
  assert.equal(ageFrom("2008-11-10", NOW), 17, "the day before is still a minor");
  assert.equal(ageFrom("2013-11-09", NOW), 13, "13th birthday is old enough");
  assert.equal(ageFrom("2013-11-10", NOW), 12, "the day before is too young");
});

test("age does not drift with month or day order", () => {
  assert.equal(ageFrom("2000-01-05", NOW), 26);
  assert.equal(ageFrom("2000-12-31", NOW), 25);
  assert.equal(ageFrom("2000-11-09", NOW), 26);
  assert.equal(ageFrom("2000-11-10", NOW), 25);
});

test("a future date is negative, never silently adult", () => {
  assert.ok(ageFrom("2030-01-01", NOW) < 0);
});

test("malformed or impossible dates are rejected", () => {
  for (const bad of [
    "",
    "9/11/2000",
    "09-11-2000",
    "2000-1-1",
    "not-a-date",
    "2000-13-01",
    "2000-02-31",
  ]) {
    assert.equal(ageFrom(bad, NOW), null, `expected null for ${JSON.stringify(bad)}`);
  }
});

test("a leap-day birthday is handled", () => {
  assert.equal(ageFrom("2008-02-29", NOW), 18);
  assert.equal(ageFrom("2008-02-29", new Date("2027-02-28T12:00:00Z")), 18);
});

test("password strength never exceeds its scale", () => {
  const cases = [
    ["", 0, "Too short"],
    ["short", 0, "Too short"],
    ["abcdefghij", 1, "Weak"],
    ["abcdefghijklmn", 2, "Fair"],
    ["Abcdefghij", 2, "Fair"],
    ["Abcdefghij1!", 3, "Strong"],
    ["Abcdefghijklm1!", 4, "Excellent"],
  ];
  for (const [pw, score, label] of cases) {
    const got = passwordScore(pw);
    assert.equal(got.score, score, `score for ${JSON.stringify(pw)}`);
    assert.equal(got.label, label, `label for ${JSON.stringify(pw)}`);
  }
});
