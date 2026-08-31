import type { StaticImageData } from "next/image";

import aboutKitchenPlay from "./photos/about-kitchen-play.jpg";
import catsKittenWindowsill from "./photos/cats-kitten-windowsill.jpg";
import catsKittensAtWindow from "./photos/cats-kittens-at-window.jpg";
import catsWindowTabby from "./photos/cats-window-tabby.jpg";
import communityKitchenMorning from "./photos/community-kitchen-morning.jpg";
import dogsAutumnBridge from "./photos/dogs-autumn-bridge.jpg";
import dogsGoldenInLeaves from "./photos/dogs-golden-in-leaves.jpg";
import dogsWhiteDogLeaves from "./photos/dogs-white-dog-leaves.jpg";
import foodDogAtBowl from "./photos/food-dog-at-bowl.jpg";
import foodDogEatingCloseup from "./photos/food-dog-eating-closeup.jpg";
import guidesDogsWinterForest from "./photos/guides-dogs-winter-forest.jpg";
import guidesWinterWalk from "./photos/guides-winter-walk.jpg";
import healthDogOnBed from "./photos/health-dog-on-bed.jpg";
import healthDogWindowLight from "./photos/health-dog-window-light.jpg";
import healthSeniorDogResting from "./photos/health-senior-dog-resting.jpg";
import trainingForestPath from "./photos/training-forest-path.jpg";

/**
 * The Pet Club photography manifest.
 *
 * ## Why this file exists
 *
 * This is the source of truth for where every photograph on the site came
 * from. An image whose provenance we cannot state is an image we cannot
 * defend, so the record lives in version control beside the file it describes
 * rather than in someone's notes. `manifest.test.ts` fails the build if any
 * field is missing or malformed.
 *
 * ## Licence
 *
 * Every asset here is licensed under the Pexels License, read from
 * https://www.pexels.com/license/ at the time of sourcing. It permits free
 * use including commercially, permits modification, and does not require
 * attribution. We credit the photographer anyway: it costs a line of type,
 * and a publication that asks readers to trust its sourcing should show its
 * own.
 *
 * The licence does carry restrictions, and two of them bind how these files
 * may be used here:
 *
 *  - Identifiable people must not appear in a bad light, and must not imply
 *    endorsement. `showsPeople` flags every asset containing an identifiable
 *    person. **Those assets must never be used to depict a Pet Club member,
 *    author, veterinary reviewer, or a real community post.** Doing so would
 *    both breach the licence and fabricate a person, which the editorial
 *    policy forbids outright.
 *  - Unaltered copies may not be sold, and the imagery may not become part of
 *    a trade mark. Neither is in prospect, but a future contributor should
 *    know before reaching for these files.
 *
 * ## Adding an image
 *
 * Download from Pexels or Unsplash only, store it in `photos/` cropped to the
 * editorial 3:2 frame at 1600px wide, and add a complete record below. If the
 * source or licence cannot be verified, the image does not go in.
 */

export const PEXELS_LICENCE = {
  name: "Pexels License",
  url: "https://www.pexels.com/license/",
  summary:
    "Free to use, including commercially. Modification permitted. Attribution not required.",
} as const;

export type MediaLicence = typeof PEXELS_LICENCE;

export interface MediaAsset {
  /** Stable key used by pages to request this asset. Matches the filename. */
  id: string;
  /** Static import — supplies intrinsic dimensions and a build-time blur. */
  src: StaticImageData;
  /** Path within `src/media`, recorded so the file stays traceable. */
  file: string;
  /** Default alternative text. Call sites may pass `alt=""` if decorative. */
  alt: string;
  photographer: string;
  source: "Pexels";
  /** The page the image was licensed from. */
  sourceUrl: string;
  licence: MediaLicence;
  /**
   * Whether an identifiable person appears. See the licence note above: these
   * must not be used to represent a real member, author or reviewer.
   */
  showsPeople: boolean;
}

const assets = {
  "dogs-autumn-bridge": {
    id: "dogs-autumn-bridge",
    src: dogsAutumnBridge,
    file: "photos/dogs-autumn-bridge.jpg",
    alt: "A golden retriever trots along a wooden footbridge covered in fallen autumn leaves.",
    photographer: "Kristian Aleksandrov",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/golden-retriever-on-leaf-covered-autumn-bridge-34458370/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "cats-window-tabby": {
    id: "cats-window-tabby",
    src: catsWindowTabby,
    file: "photos/cats-window-tabby.jpg",
    alt: "A ginger tabby cat lies on a windowsill in daylight, watching the street outside.",
    photographer: "Mrb bgp",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/orange-tabby-cat-gazing-out-window-indoors-30219584/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "health-senior-dog-resting": {
    id: "health-senior-dog-resting",
    src: healthSeniorDogResting,
    file: "photos/health-senior-dog-resting.jpg",
    alt: "An elderly black dog with a greying muzzle rests on a wooden floor.",
    photographer: "Lübna Abdullah",
    source: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/sleepy-old-dog-16377487/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "food-dog-at-bowl": {
    id: "food-dog-at-bowl",
    src: foodDogAtBowl,
    file: "photos/food-dog-at-bowl.jpg",
    alt: "A dog eats from a white bowl on a kitchen floor while a hand rests on its head.",
    photographer: "cottonbro studio",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/a-person-petting-a-dog-eating-dog-food-6568944/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "training-forest-path": {
    id: "training-forest-path",
    src: trainingForestPath,
    file: "photos/training-forest-path.jpg",
    alt: "A small dog sits attentively on a wet forest path, watching its handler's hand signal.",
    photographer: "Michał Robak",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/woman-in-forest-training-small-dog-on-autumn-day-29590678/",
    licence: PEXELS_LICENCE,
    showsPeople: true,
  },
  "guides-winter-walk": {
    id: "guides-winter-walk",
    src: guidesWinterWalk,
    file: "photos/guides-winter-walk.jpg",
    alt: "A dog runs ahead along a snow-covered trail while two people walk behind with another dog.",
    photographer: "mali maeder",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/2-person-and-2-dog-walking-in-the-snow-during-daytime-104329/",
    licence: PEXELS_LICENCE,
    showsPeople: true,
  },

  "dogs-golden-in-leaves": {
    id: "dogs-golden-in-leaves",
    src: dogsGoldenInLeaves,
    file: "photos/dogs-golden-in-leaves.jpg",
    alt: "A golden retriever sits among fallen leaves in autumn woodland.",
    photographer: "Barnabas Davoti",
    source: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/golden-retriever-on-dried-leaves-10096128/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "dogs-white-dog-leaves": {
    id: "dogs-white-dog-leaves",
    src: dogsWhiteDogLeaves,
    file: "photos/dogs-white-dog-leaves.jpg",
    alt: "A white dog in a leather collar sits on a carpet of yellow autumn leaves.",
    photographer: "Галина Ласаева",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/close-up-shot-of-a-white-dog-sitting-on-fallen-leaves-14310001/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "cats-kitten-windowsill": {
    id: "cats-kitten-windowsill",
    src: catsKittenWindowsill,
    file: "photos/cats-kitten-windowsill.jpg",
    alt: "A ginger kitten sits in soft daylight beside a bright window.",
    photographer: "大 董",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/curious-orange-kitten-on-sunny-window-sill-34389856/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "cats-kittens-at-window": {
    id: "cats-kittens-at-window",
    src: catsKittensAtWindow,
    file: "photos/cats-kittens-at-window.jpg",
    alt: "Two kittens sit side by side on a windowsill, looking out at the daylight.",
    photographer: "Lera Mk",
    source: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/kittens-sitting-next-to-a-window-sill-10480376/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "food-dog-eating-closeup": {
    id: "food-dog-eating-closeup",
    src: foodDogEatingCloseup,
    file: "photos/food-dog-eating-closeup.jpg",
    alt: "A close view of a dog eating dry food from a bowl.",
    photographer: "cottonbro studio",
    source: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/close-up-shot-of-a-dog-eating-6568949/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "health-dog-window-light": {
    id: "health-dog-window-light",
    src: healthDogWindowLight,
    file: "photos/health-dog-window-light.jpg",
    alt: "A shaggy dog rests on a sofa in a shaft of window light.",
    photographer: "Kata Pal",
    source: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/dog-lying-on-couch-1258862/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "health-dog-on-bed": {
    id: "health-dog-on-bed",
    src: healthDogOnBed,
    file: "photos/health-dog-on-bed.jpg",
    alt: "A small dog lies on a bed in morning light beside its owner's hand.",
    photographer: "Samson Katt",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/dog-lying-on-bed-near-faceless-young-female-owner-5255155/",
    licence: PEXELS_LICENCE,
    showsPeople: true,
  },
  "guides-dogs-winter-forest": {
    id: "guides-dogs-winter-forest",
    src: guidesDogsWinterForest,
    file: "photos/guides-dogs-winter-forest.jpg",
    alt: "Two dogs stand among snow-covered pines in a winter forest.",
    photographer: "Elina Volkova",
    source: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/dogs-in-a-forest-in-winter-19920245/",
    licence: PEXELS_LICENCE,
    showsPeople: false,
  },
  "community-kitchen-morning": {
    id: "community-kitchen-morning",
    src: communityKitchenMorning,
    file: "photos/community-kitchen-morning.jpg",
    alt: "A man stands in a home kitchen with a coffee cup while his dog waits beside him.",
    photographer: "Zen Chung",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/black-man-standing-with-cup-of-coffee-and-croissant-near-akita-inu-5749807/",
    licence: PEXELS_LICENCE,
    showsPeople: true,
  },
  "about-kitchen-play": {
    id: "about-kitchen-play",
    src: aboutKitchenPlay,
    file: "photos/about-kitchen-play.jpg",
    alt: "A man crouches in a kitchen playing with a white dog in daylight.",
    photographer: "Anastasia Shuraeva",
    source: "Pexels",
    sourceUrl:
      "https://www.pexels.com/photo/man-and-dog-standing-and-playing-in-kitchen-5482196/",
    licence: PEXELS_LICENCE,
    showsPeople: true,
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaAssetId = keyof typeof assets;

export const mediaAssets = assets;

/** Every asset, for the provenance tests and a future credits page. */
export const allMediaAssets: readonly MediaAsset[] = Object.values(assets);

/** Resolves an asset by id. */
export function getMediaAsset(id: MediaAssetId): MediaAsset {
  return assets[id];
}
