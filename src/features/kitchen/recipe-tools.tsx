"use client";
import { useState } from "react";
import styles from "./kitchen.module.css";
export function RecipeTools({ title, slug, image }: { title: string; slug: string; image: string }) {
  const [status, setStatus] = useState("");
  async function share() {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) { await navigator.share({ title, url }); setStatus("Shared."); }
      else { await navigator.clipboard.writeText(url); setStatus("Link copied. Ready to share."); }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStatus("Use your browser’s share menu to copy this page link.");
    }
  }
  return <div className={styles.tools}><button onClick={share}>Share recipe ↗</button><button onClick={() => window.print()}>Print / save PDF</button><a href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(`https://thepetclub.ca/kitchen/${slug}`)}&media=${encodeURIComponent(`https://thepetclub.ca${image}`)}&description=${encodeURIComponent(`${title}: a plain cooked extra, not a complete pet diet. AI food illustration.`)}`} target="_blank" rel="noopener noreferrer">Save to Pinterest ↗</a><span className={styles.toolStatus} role="status">{status}</span></div>;
}
