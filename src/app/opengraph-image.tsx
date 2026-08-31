import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social share card.
 *
 * Generated at build time by `next/og` rather than checked in as a binary, so
 * the brand copy has exactly one source of truth (`config/site.ts`) and the
 * image cannot drift from the tagline. The wordmark itself now reads from
 * `siteConfig.wordmark` too; it was hard-coded here, and so still said
 * "PetsClub.ca" on every share card long after the site became thepetclub.ca.
 * Uses system font stacks only, which keeps generation dependency-free and
 * fast.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fcfcfa",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "14px",
              height: "56px",
              backgroundColor: "#24523d",
              borderRadius: "3px",
            }}
          />
          <div style={{ display: "flex", fontSize: "40px", color: "#1c1b19" }}>
            {/*
              `whiteSpace: pre` keeps the space `lead` carries before the
              accent — Satori collapses trailing whitespace in a flex item
              otherwise, which would render "The PetClub.ca".
            */}
            <span style={{ fontWeight: 700, whiteSpace: "pre" }}>
              {siteConfig.wordmark.lead}
            </span>
            <span style={{ fontWeight: 700, color: "#24523d" }}>
              {siteConfig.wordmark.accent}
            </span>
            <span style={{ color: "#7c7970" }}>{siteConfig.wordmark.suffix}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 700,
              color: "#1c1b19",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Canada&rsquo;s community for pet parents.
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#5f5d56",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.4,
            }}
          >
            Ask questions, share experiences, and discover trusted pet advice.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "26px",
            color: "#7c7970",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {siteConfig.domain}
        </div>
      </div>
    ),
    size,
  );
}
