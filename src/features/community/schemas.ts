import { z } from "zod";
import { findCommunityCategory } from "./taxonomy";

export const discussionSchema = z.object({
  category: z.string().refine(value => Boolean(findCommunityCategory(value)), "Choose a community topic."),
  title: z.string().trim().min(5, "Use at least 5 characters for the title.").max(160),
  body: z.string().trim().min(10, "Add a few details (at least 10 characters).").max(12000),
});
export const replySchema = z.object({ threadId: z.uuid(), body: z.string().trim().min(1).max(10000) });
export type CommunityResult = { error?: string; url?: string; success?: boolean };
