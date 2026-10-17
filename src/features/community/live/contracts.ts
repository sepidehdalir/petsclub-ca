import { z } from "zod";

export const communityMutationSchema = z
  .object({
    requestId: z.uuid(),
    operation: z.enum([
      "thread",
      "reply",
      "edit_thread",
      "edit_post",
      "delete_thread",
      "delete_post",
      "report_thread",
      "report_post",
      "moderate_thread",
      "moderate_post",
      "resolve_report",
    ]),
    target: z.uuid().optional(),
    category: z.string().max(100).optional(),
    title: z.string().trim().min(5).max(160).optional(),
    body: z.string().trim().min(1).max(20000).optional(),
    status: z.enum(["published", "locked", "hidden", "deleted"]).optional(),
    reason: z.string().trim().min(5).max(1000).optional(),
  })
  .superRefine((v, ctx) => {
    const needs = (
      key: "target" | "category" | "title" | "body" | "status" | "reason",
    ) => {
      if (!v[key])
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required.`,
        });
    };
    if (v.operation === "thread") {
      needs("category");
      needs("title");
      needs("body");
    } else needs("target");
    if (["reply", "edit_thread", "edit_post"].includes(v.operation))
      needs("body");
    if (v.operation === "edit_thread") needs("title");
    if (
      v.operation.startsWith("report_") ||
      v.operation.startsWith("moderate_") ||
      v.operation === "resolve_report"
    )
      needs("reason");
    if (v.operation.startsWith("moderate_")) needs("status");
  });
export type CommunityMutation = z.infer<typeof communityMutationSchema>;
export type CommunityFormState = { error?: string; success?: string };
export function pageNumber(value: string | string[] | undefined): number {
  const n = typeof value === "string" ? Number(value) : 1;
  return Number.isInteger(n) && n > 0 && n <= 10000 ? n : 1;
}
