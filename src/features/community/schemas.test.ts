import { describe, expect, it } from "vitest";
import { discussionSchema, replySchema } from "./schemas";

describe("community input boundaries", () => {
  const valid = { category: "lost-dogs", title: "Missing golden retriever", body: "Last seen near the public park." };
  it("accepts a known category and trims content", () => {
    expect(discussionSchema.parse({ ...valid, title: ` ${valid.title} ` }).title).toBe(valid.title);
  });
  it("rejects unknown categories and empty content", () => {
    expect(discussionSchema.safeParse({ ...valid, category: "invented" }).success).toBe(false);
    expect(discussionSchema.safeParse({ ...valid, body: "   " }).success).toBe(false);
  });
  it("bounds titles and post bodies", () => {
    expect(discussionSchema.safeParse({ ...valid, title: "x".repeat(161) }).success).toBe(false);
    expect(discussionSchema.safeParse({ ...valid, body: "x".repeat(12001) }).success).toBe(false);
  });
  it("requires a valid thread UUID and nonblank reply", () => {
    expect(replySchema.safeParse({ threadId: "invalid", body: "Hello" }).success).toBe(false);
    expect(replySchema.safeParse({ threadId: "123e4567-e89b-42d3-a456-426614174000", body: " " }).success).toBe(false);
    expect(replySchema.safeParse({ threadId: "123e4567-e89b-42d3-a456-426614174000", body: "Hello" }).success).toBe(true);
  });
});
