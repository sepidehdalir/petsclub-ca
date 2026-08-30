import { describe, expect, it } from "vitest";

import {
  confirmEmailSchema,
  emailOtpTypeSchema,
  isSafeRedirectPath,
  safeRedirectPath,
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  tokenHashSchema,
} from "@/features/auth/schemas";

/**
 * `isSafeRedirectPath` is the application's open-redirect defence. These cases
 * are the payloads that actually get tried against `?next=` parameters, so a
 * regression here is a real vulnerability rather than a cosmetic bug.
 */
describe("isSafeRedirectPath", () => {
  it("accepts site-relative paths", () => {
    expect(isSafeRedirectPath("/")).toBe(true);
    expect(isSafeRedirectPath("/account")).toBe(true);
    expect(isSafeRedirectPath("/community/dog-health")).toBe(true);
    expect(isSafeRedirectPath("/search?q=insurance")).toBe(true);
  });

  it("rejects absolute URLs", () => {
    expect(isSafeRedirectPath("https://evil.example")).toBe(false);
    expect(isSafeRedirectPath("http://evil.example/account")).toBe(false);
  });

  it("rejects protocol-relative URLs", () => {
    expect(isSafeRedirectPath("//evil.example")).toBe(false);
    expect(isSafeRedirectPath("//evil.example/account")).toBe(false);
  });

  it("rejects backslash variants that some browsers normalise to a host", () => {
    expect(isSafeRedirectPath("/\\evil.example")).toBe(false);
    expect(isSafeRedirectPath("/account\\@evil.example")).toBe(false);
  });

  it("rejects other schemes and empty values", () => {
    expect(isSafeRedirectPath("javascript:alert(1)")).toBe(false);
    expect(isSafeRedirectPath("mailto:someone@example.com")).toBe(false);
    expect(isSafeRedirectPath("")).toBe(false);
    expect(isSafeRedirectPath(null)).toBe(false);
    expect(isSafeRedirectPath(undefined)).toBe(false);
  });
});

describe("safeRedirectPath", () => {
  it("returns the value when it is safe", () => {
    expect(safeRedirectPath("/account")).toBe("/account");
  });

  it("falls back when the value is unsafe", () => {
    expect(safeRedirectPath("https://evil.example", "/account")).toBe("/account");
    expect(safeRedirectPath(null)).toBe("/");
  });
});

describe("signUpSchema", () => {
  it("accepts valid input and normalises the email", () => {
    const result = signUpSchema.safeParse({
      displayName: "  Sam Rivard  ",
      email: "  Sam.Rivard@Example.COM ",
      password: "a-long-enough-passphrase",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("sam.rivard@example.com");
      expect(result.data.displayName).toBe("Sam Rivard");
    }
  });

  it("rejects passwords under the minimum length", () => {
    const result = signUpSchema.safeParse({
      displayName: "Sam",
      email: "sam@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "password")).toBe(true);
    }
  });

  it("rejects malformed email addresses", () => {
    const result = signUpSchema.safeParse({
      displayName: "Sam",
      email: "not-an-email",
      password: "a-long-enough-passphrase",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a display name that is too short", () => {
    const result = signUpSchema.safeParse({
      displayName: "S",
      email: "sam@example.com",
      password: "a-long-enough-passphrase",
    });

    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("does not impose a length rule on an existing password", () => {
    // Sign-in must accept any password the account already has, including one
    // created before the current minimum length was introduced.
    const result = signInSchema.safeParse({ email: "sam@example.com", password: "old" });
    expect(result.success).toBe(true);
  });

  it("requires a password to be present", () => {
    const result = signInSchema.safeParse({ email: "sam@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires both passwords to match", () => {
    const result = resetPasswordSchema.safeParse({
      password: "a-long-enough-passphrase",
      confirmPassword: "a-different-passphrase",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "confirmPassword")).toBe(
        true,
      );
    }
  });

  it("accepts matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "a-long-enough-passphrase",
      confirmPassword: "a-long-enough-passphrase",
    });

    expect(result.success).toBe(true);
  });
});

/**
 * `type` and `token_hash` reach `/auth/confirm` straight from a query string,
 * so they are attacker-controllable. These schemas are what stands between an
 * arbitrary string and a `verifyOtp` call.
 */
describe("emailOtpTypeSchema", () => {
  it("accepts the email token types this application issues", () => {
    for (const type of ["signup", "recovery", "invite", "magiclink", "email_change", "email"]) {
      expect(emailOtpTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it("rejects phone token types, which this application has no flows for", () => {
    expect(emailOtpTypeSchema.safeParse("sms").success).toBe(false);
    expect(emailOtpTypeSchema.safeParse("phone_change").success).toBe(false);
  });

  it("rejects arbitrary and empty values", () => {
    expect(emailOtpTypeSchema.safeParse("").success).toBe(false);
    expect(emailOtpTypeSchema.safeParse("../../admin").success).toBe(false);
    expect(emailOtpTypeSchema.safeParse("SIGNUP").success).toBe(false);
  });
});

describe("tokenHashSchema", () => {
  it("accepts a realistic token", () => {
    expect(tokenHashSchema.safeParse("a".repeat(64)).success).toBe(true);
    expect(tokenHashSchema.safeParse("pkce_9f8e7d6c5b4a3210_ABC-def").success).toBe(true);
  });

  it("rejects values that are absent or too short to be a token", () => {
    expect(tokenHashSchema.safeParse("").success).toBe(false);
    expect(tokenHashSchema.safeParse("short").success).toBe(false);
  });

  it("rejects tokens mangled by a mail client", () => {
    // Wrapped across a line, or with markup appended by a link rewriter.
    expect(tokenHashSchema.safeParse("a".repeat(30) + " " + "b".repeat(30)).success).toBe(false);
    expect(tokenHashSchema.safeParse("a".repeat(40) + "<br>").success).toBe(false);
    expect(tokenHashSchema.safeParse("a".repeat(600)).success).toBe(false);
  });
});

describe("confirmEmailSchema", () => {
  it("accepts a well-formed confirmation submission", () => {
    const result = confirmEmailSchema.safeParse({
      tokenHash: "a".repeat(64),
      type: "signup",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a valid token paired with an unsupported type", () => {
    expect(
      confirmEmailSchema.safeParse({ tokenHash: "a".repeat(64), type: "sms" }).success,
    ).toBe(false);
  });

  it("rejects a supported type paired with a missing token", () => {
    expect(confirmEmailSchema.safeParse({ tokenHash: "", type: "recovery" }).success).toBe(false);
  });
});
