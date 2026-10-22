"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { recipes } from "./recipes";
import styles from "./kitchen.module.css";
export function RecipeGrid() {
  const [filter, setFilter] = useState("All recipes");
  const visible = recipes.filter(recipe => filter === "All recipes" || recipe.species.includes(filter === "For dogs" ? "Dogs" : "Cats"));
  return <><div className={styles.filters} aria-label="Filter recipes by pet">{["All recipes", "For dogs", "For cats"].map(label => <button key={label} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}</button>)}</div><p className="sr-only" role="status">{visible.length} recipes shown</p><div className={styles.grid}>{visible.map(recipe => <article className={styles.card} key={recipe.slug}><Link href={`/kitchen/${recipe.slug}`} prefetch={false}><div className={styles.imageBox}><Image src={recipe.image} alt={recipe.imageAlt} width={1200} height={900} unoptimized /><span className={styles.badge}>{recipe.species.join(" + ")}</span></div><div className={styles.cardMeta}><span>{recipe.kind}</span><span>{recipe.timeLabel} · {recipe.ingredientCount} ingredients</span></div><h3>{recipe.title} <span aria-hidden="true">↗</span></h3><p>{recipe.description}</p></Link></article>)}</div></>;
}
