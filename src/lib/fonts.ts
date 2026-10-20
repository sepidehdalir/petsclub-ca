import { Bricolage_Grotesque, DM_Sans, Instrument_Serif } from "next/font/google";

export const displayFont = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", variable: "--font-bricolage" });
export const bodyFont = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--font-dm" });
export const accentFont = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap", variable: "--font-instrument" });
