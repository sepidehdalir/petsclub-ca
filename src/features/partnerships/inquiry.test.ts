import { describe, expect, it } from "vitest";
import { inquiryDraft } from "./inquiry";
describe("email draft preparation", () => {
  it("encodes content without introducing mail headers or changing the recipient", () => {
    const draft = inquiryDraft("Brand partnership", "Example\r\nBcc: other@example.invalid", "A & B?\nSecond line");
    expect(draft).not.toBeNull();
    expect(draft!.subject).not.toMatch(/[\r\n]/);
    const url = new URL(draft!.href);
    expect(url.pathname).toBe("hello@thepetclub.ca");
    expect(url.searchParams.get("body")).toBe(draft!.body);
    expect(url.searchParams.has("bcc")).toBe(false);
  });
  it("rejects empty, oversized and unknown enquiry types", () => {
    expect(inquiryDraft("Brand partnership", "", " ")).toBeNull();
    expect(inquiryDraft("Brand partnership", "", "x".repeat(3001))).toBeNull();
    expect(inquiryDraft("Unknown", "", "Hello")).toBeNull();
  });
});
