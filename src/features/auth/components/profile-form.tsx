"use client";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateProfile } from "../profile-actions";

export function ProfileForm({ profile }: { profile: { display_name: string; bio: string | null; city: string | null; province: string | null } }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(data);
      setMessage(result.error ?? "Your profile is saved.");
      if (result.success) router.refresh();
    });
  }
  return <details className="mt-8"><summary className="cursor-pointer text-title-3">Make yourself at home — edit your profile</summary><form onSubmit={submit} className="community-compose mt-5"><p className="text-sm">These profile details are public. Use a first name or nickname and avoid private contact details.</p><label htmlFor="profile-name">Display name<input id="profile-name" name="display_name" defaultValue={profile.display_name} minLength={2} maxLength={60} required autoComplete="nickname" /></label><label htmlFor="profile-city">City (optional)<input id="profile-city" name="city" defaultValue={profile.city ?? ""} maxLength={80} autoComplete="address-level2" /></label><label htmlFor="profile-province">Province (optional)<select id="profile-province" name="province" defaultValue={profile.province ?? ""} autoComplete="address-level1"><option value="">Prefer not to say</option>{["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"].map(code => <option key={code} value={code}>{code}</option>)}</select></label><label htmlFor="profile-bio">A little about you (optional)<textarea id="profile-bio" name="bio" defaultValue={profile.bio ?? ""} maxLength={500} rows={4} /></label><Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button><p role="status">{message}</p></form></details>;
}
