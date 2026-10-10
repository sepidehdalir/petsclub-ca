import type { StaticImageData } from "next/image";

/** Only populate after exact-model identification and commercial permission are documented. */
export interface LicensedProductImage {
  src: StaticImageData;
  alt: string;
  permissionReference: string;
  sourceUrl: string;
}

export interface Product {
  id: string;
  name: string;
  use: string;
  construction: string;
  activity: string;
  features: readonly [string, string, string];
  image?: LicensedProductImage;
  considerations: string;
  source: string;
  checkedOn: string;
  /** Assign only after the real program and destination have been approved. */
  offerId?: string;
}

/** Retailer specifications, not hands-on reviews or a ranking. No price feed. */
export const products: readonly Product[] = [
  {
    id: "catit-digger", offerId: "amazon-catit-digger", name: "Catit Senses 2.0 Digger",
    use: "A food puzzle for a cat that enjoys reaching for dry food or treats.",
    construction: "Removable narrow and wide cups on a base.",
    activity: "Food exploration",
    features: ["For dry food or treats", "Narrow and wide cups", "Removable cups for cleaning"],
    considerations: "Check cup access for your cat’s size. Supervise use and remove damaged parts. Follow the retailer’s hand-washing instructions.",
    source: "https://www.homesalive.ca/cat/bowls-and-feeders/automatic/catit-senses-2-0-digger.html",
    checkedOn: "2026-10-09",
  },
  {
    id: "catit-wave", offerId: "amazon-catit-wave", name: "Catit Senses 2.0 Wave Circuit",
    use: "A track toy for a cat that enjoys batting a moving ball; it does not dispense food.",
    construction: "A raised, enclosed ball track with openings for play.",
    activity: "Chase & play",
    features: ["Moving ball play", "Raised, enclosed track", "Openings for paw access"],
    considerations: "Allow floor space for the assembled track. Supervise use and remove damaged parts. Follow the retailer’s hand-washing instructions.",
    source: "https://www.homesalive.ca/cat/toys/catit-senses/catit-senses-2-0-wave-circuit.html",
    checkedOn: "2026-10-09",
  },
];
export function findProduct(id: string) {
  return products.find((product) => product.id === id);
}
