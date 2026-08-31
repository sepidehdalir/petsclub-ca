import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { allMediaAssets, getMediaAsset, mediaAssets } from "@/media/manifest";

/**
 * Provenance guards.
 *
 * A photograph we cannot attribute is a photograph we cannot publish. These
 * assertions make an incomplete record a failing build rather than something
 * discovered when someone asks where an image came from.
 */
describe("media manifest", () => {
  it("records complete provenance for every asset", () => {
    for (const asset of allMediaAssets) {
      expect(asset.photographer.trim().length, `${asset.id}: photographer`).toBeGreaterThan(0);
      expect(asset.alt.trim().length, `${asset.id}: alt`).toBeGreaterThan(0);
      expect(asset.licence.name.length, `${asset.id}: licence`).toBeGreaterThan(0);
      expect(asset.licence.url, `${asset.id}: licence url`).toMatch(/^https:\/\//);
      expect(typeof asset.showsPeople, `${asset.id}: showsPeople`).toBe("boolean");
    }
  });

  it("licenses every asset from an approved platform, and links the original", () => {
    // Pexels and Unsplash are the only permitted sources. A URL that does not
    // point at the platform it claims is a provenance record we cannot trust.
    const hosts: Record<string, string> = {
      Pexels: "https://www.pexels.com/photo/",
      Unsplash: "https://unsplash.com/photos/",
    };

    for (const asset of allMediaAssets) {
      const prefix = hosts[asset.source];
      expect(prefix, `${asset.id}: unapproved source ${asset.source}`).toBeDefined();
      expect(asset.sourceUrl, `${asset.id}: sourceUrl`).toContain(prefix);
    }
  });

  it("keys every asset by its own id and points at a file that exists", () => {
    for (const [key, asset] of Object.entries(mediaAssets)) {
      expect(asset.id, "manifest key must match asset id").toBe(key);
      expect(asset.file).toBe(`photos/${key}.jpg`);

      const onDisk = fileURLToPath(new URL(asset.file, import.meta.url));
      expect(existsSync(onDisk), `${asset.id}: ${asset.file} is missing`).toBe(true);
    }
  });

  it("stores every asset in the editorial 3:2 frame at a usable width", () => {
    // Read the dimensions out of the file rather than off `asset.src`: under
    // Vitest a `.jpg` import is just a path string, because Next's image
    // loader is not in play. Parsing the JPEG is both environment-independent
    // and a check on the real thing — it is the stored pixels that decide
    // whether a frame shifts or an image arrives soft.
    for (const asset of allMediaAssets) {
      const file = fileURLToPath(new URL(asset.file, import.meta.url));
      const size = jpegSize(readFileSync(file));

      expect(size, `${asset.id}: not a readable JPEG`).not.toBeNull();
      expect(size!.width, `${asset.id}: too small to serve`).toBeGreaterThanOrEqual(1200);

      const ratio = size!.width / size!.height;
      expect(ratio, `${asset.id}: not cropped to 3:2 (got ${size!.width}x${size!.height})`)
        .toBeCloseTo(3 / 2, 2);
    }
  });

  it("resolves assets by id", () => {
    expect(getMediaAsset("dogs-autumn-bridge").photographer).toBe("Kristian Aleksandrov");
  });
});

/**
 * Intrinsic size of a JPEG, from its first Start Of Frame marker.
 *
 * Small enough to not be worth a dependency, and it keeps the provenance
 * tests free of any build tooling.
 */
function jpegSize(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.readUInt16BE(0) !== 0xffd8) {
    return null;
  }

  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1]!;
    // SOF0-SOF15 carry the frame dimensions. C4 (Huffman table), C8 (JPEG
    // extension) and CC (arithmetic coding) share the range but do not.
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + buffer.readUInt16BE(offset + 2);
  }

  return null;
}
