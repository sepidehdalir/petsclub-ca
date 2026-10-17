"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { communityMutationSchema, type CommunityFormState } from "./contracts";
import { communityIdentity } from "./server";

export async function mutateCommunity(
  _previous: CommunityFormState,
  form: FormData,
): Promise<CommunityFormState> {
  const values = Object.fromEntries(
    [...form.entries()].filter(([, v]) => typeof v === "string" && v !== ""),
  );
  const parsed = communityMutationSchema.safeParse(values);
  if (!parsed.success)
    return {
      error:
        "Check the required fields and length limits. Your text has not been submitted.",
    };
  const { client, user } = await communityIdentity();
  if (!client || !user?.email_confirmed_at)
    return {
      error:
        "Sign in with a confirmed email address to contribute. Your text has not been submitted.",
    };
  const { data, error } = await client.rpc("community_mutate", {
    request_id: parsed.data.requestId,
    payload: parsed.data,
  });
  if (error || !data)
    return {
      error:
        "This action could not be completed. You may have reached a posting limit, or the discussion may have changed. Keep your text and try again later.",
    };
  revalidatePath("/community", "layout");
  if (parsed.data.operation === "thread")
    redirect(`/community/discussions/${data}`);
  return { success: "Saved. The discussion has been refreshed." };
}
