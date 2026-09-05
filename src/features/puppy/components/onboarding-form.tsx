"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Field, fieldIds, Input, Select } from "@/components/ui/field";
import { resolveAgeFromInput, todayInToronto } from "@/features/puppy/age";
import { allBreeds, provinces } from "@/features/puppy/model";
import {
  parseStoredPuppy,
  readStoredPuppyRaw,
  subscribeToStoredPuppy,
  writeStoredPuppy,
} from "@/features/puppy/storage";

/**
 * Journey onboarding.
 *
 * ## Three fields, one of them required
 *
 * Date of birth is the only thing the Journey cannot work without. Breed and
 * province are optional and stated to be optional, because a form that
 * demands five answers before showing anything is how people leave. Province
 * carries a short note about what it unlocks — it is the field that produces
 * the most distinctive content, so it earns one line of persuasion rather
 * than a required marker.
 *
 * ## Why validation happens here rather than on submit
 *
 * A date of birth is easy to mistype by a year, and the failure is silent —
 * "your puppy is 2 years old" reads as a fact rather than as an error. So the
 * resolved age is echoed back live, under the field, before anything is
 * submitted. That turns a typo into something the reader notices themselves.
 *
 * ## Why `useSyncExternalStore` for the saved puppy
 *
 * `localStorage` is an external store, and restoring from it in an effect
 * means rendering once with empty fields and then again with the real ones —
 * a flash, a cascading render, and a lint rule that correctly objects. This
 * hook is the API for exactly this: it reads a server snapshot of `null`, so
 * the markup is stable through hydration, and a same-value snapshot means no
 * second render when there is nothing stored.
 */
export function OnboardingForm() {
  const router = useRouter();

  // A previous anonymous session, read as a stable string snapshot.
  const storedRaw = useSyncExternalStore(
    subscribeToStoredPuppy,
    readStoredPuppyRaw,
    () => null,
  );
  const stored = useMemo(() => parseStoredPuppy(storedRaw), [storedRaw]);

  // `undefined` means "not edited yet", so the restored value shows through
  // until the reader changes it. An empty string is a real edit and stays.
  const [dobEdit, setDobEdit] = useState<string | undefined>(undefined);
  const [breedEdit, setBreedEdit] = useState<string | undefined>(undefined);
  const [provinceEdit, setProvinceEdit] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const dob = dobEdit ?? stored?.dob ?? "";
  const breed = breedEdit ?? stored?.breedSlug ?? "";
  const province = provinceEdit ?? stored?.province ?? "";

  const setDob = setDobEdit;
  const setBreed = setBreedEdit;
  const setProvince = setProvinceEdit;

  const result = dob ? resolveAgeFromInput(dob) : null;
  const today = todayInToronto();
  const maxDate = `${today.year}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`;

  const problemMessage =
    result && !result.ok
      ? result.problem === "future"
        ? "That date is in the future. Check the year?"
        : result.problem === "implausible"
          ? "That is more than three years ago — this Journey covers puppies. Check the year?"
          : "That does not look like a complete date yet."
      : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!result?.ok) {
      return;
    }

    writeStoredPuppy({
      dob,
      breedSlug: breed || undefined,
      province: province || undefined,
    });

    const params = new URLSearchParams({ dob });
    if (breed) params.set("breed", breed);
    if (province) params.set("province", province);

    router.push(`/my-puppy?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Field
        htmlFor="puppy-dob"
        label="When was your puppy born?"
        hint="If you are not certain, your best estimate is fine — you can change it later."
        error={touched && problemMessage ? problemMessage : undefined}
      >
        <Input
          id="puppy-dob"
          type="date"
          value={dob}
          max={maxDate}
          onChange={(event) => setDob(event.target.value)}
          aria-describedby={
            touched && problemMessage ? fieldIds("puppy-dob").errorId : fieldIds("puppy-dob").hintId
          }
          aria-invalid={touched && problemMessage ? true : undefined}
          required
        />
      </Field>

      {/* The live echo. This is the whole reason a mistyped year gets caught. */}
      {result?.ok ? (
        <p aria-live="polite" className="-mt-3 text-body-sm text-pine-800">
          That makes your puppy <strong className="font-semibold">{result.age.label}</strong> today.
        </p>
      ) : null}

      <Field
        htmlFor="puppy-breed"
        label="Breed"
        hint="Optional. We use it mainly to work out adult size, which is what actually changes the advice."
      >
        <Select
          id="puppy-breed"
          value={breed}
          onChange={(event) => setBreed(event.target.value)}
          aria-describedby={fieldIds("puppy-breed").hintId}
        >
          <option value="">Prefer not to say</option>
          {allBreeds.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        htmlFor="puppy-province"
        label="Province or territory"
        hint="Optional, and the field that changes the most — rabies rules, licensing and parasite timing all differ across Canada."
      >
        <Select
          id="puppy-province"
          value={province}
          onChange={(event) => setProvince(event.target.value)}
          aria-describedby={fieldIds("puppy-province").hintId}
        >
          <option value="">Prefer not to say</option>
          {provinces.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="pt-1">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Start the Journey
        </Button>
        <p className="mt-3 text-caption text-foreground-subtle">
          No account needed. What you enter stays in this browser.
        </p>
      </div>
    </form>
  );
}
