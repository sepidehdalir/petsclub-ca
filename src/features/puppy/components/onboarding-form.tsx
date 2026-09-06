"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Field, fieldIds, Input, Select } from "@/components/ui/field";
import { resolveAgeFromInput, todayLocal } from "@/features/puppy/age";
import { allBreeds, findBreed, provinces, sizeGroups } from "@/features/puppy/model";
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
  const [sizeEdit, setSizeEdit] = useState<string | undefined>(undefined);
  const [sizeTouched, setSizeTouched] = useState(false);
  const [touched, setTouched] = useState(false);

  const dob = dobEdit ?? stored?.dob ?? "";
  const breed = breedEdit ?? stored?.breedSlug ?? "";
  const province = provinceEdit ?? stored?.province ?? "";

  const setDob = setDobEdit;
  const setProvince = setProvinceEdit;

  // Size is its own answer. A known breed suggests one and the suggestion is
  // shown selected, but it is only a default: once the reader touches the
  // field their answer wins, including "Not sure", which resolves to no size
  // at all rather than falling back to the breed.
  //
  // `sizeTouched` is what separates "the reader said medium" from "choosing a
  // Poodle filled in medium". Without it, picking a Bernese and then switching
  // to "Mixed breed or not sure" leaves `giant` sitting in the field — an
  // answer the reader never gave, which is the whole failure this field
  // exists to end.
  const suggestedSize = findBreed(breed)?.sizeGroup ?? "";
  const size = sizeEdit ?? stored?.sizeGroup ?? suggestedSize;

  function handleSizeChange(next: string) {
    setSizeTouched(true);
    setSizeEdit(next);
  }

  // Changing the breed re-suggests, unless the reader has answered for
  // themselves — here or in a previous session.
  function handleBreedChange(next: string) {
    setBreedEdit(next);
    if (!sizeTouched && stored?.sizeGroup === undefined) {
      setSizeEdit(findBreed(next)?.sizeGroup ?? "");
    }
  }

  // Client-side, so the reader's own calendar is available and is the correct
  // answer — no province mapping and no UTC guess needed here.
  const today = todayLocal();
  const result = dob ? resolveAgeFromInput(dob, today) : null;
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
      sizeGroup: size || undefined,
    });

    const params = new URLSearchParams({ dob });
    if (breed) params.set("breed", breed);
    if (province) params.set("province", province);
    if (size) params.set("size", size);

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
        hint="Optional. Picking one fills in the size below, which you can change."
      >
        <Select
          id="puppy-breed"
          value={breed}
          onChange={(event) => handleBreedChange(event.target.value)}
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

      {/*
        Adult size, asked outright.

        It used to be inferred from breed alone, which meant "Mixed breed or
        not sure" silently became medium and the page then printed "Medium
        breed \u00b7 about 11\u201325 kg" back at someone who had just said they did
        not know. Size drives the skeletal-maturity, adult-food, exercise and
        neutering guidance, so guessing it is not a small liberty.

        "Not sure" is a real option and resolves to no size at all.
      */}
      <Field
        htmlFor="puppy-size"
        label="Expected adult size"
        hint="Optional, and the single thing that changes the guidance most. If you do not know, say so — we would rather show less than guess."
      >
        <Select
          id="puppy-size"
          value={size}
          onChange={(event) => handleSizeChange(event.target.value)}
          aria-describedby={fieldIds("puppy-size").hintId}
        >
          <option value="">Prefer not to say</option>
          {Object.values(sizeGroups).map((group) => (
            <option key={group.id} value={group.id}>
              {group.label} &mdash; {group.adultWeight}
            </option>
          ))}
          <option value="unknown">Not sure</option>
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
