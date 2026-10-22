import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/shared/json-ld";
import { recipes, findRecipe } from "@/features/kitchen/recipes";
import { RecipeTools } from "@/features/kitchen/recipe-tools";
import styles from "@/features/kitchen/kitchen.module.css";
export function generateStaticParams() { return recipes.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const recipe = findRecipe(slug); if (!recipe) return {}; return createMetadata({ title: `${recipe.title} for ${recipe.species.join(" & ").toLowerCase()}`, description: recipe.description, path: `/kitchen/${slug}`, type: "article", image: { url: recipe.image, width: 1200, height: 900, alt: recipe.imageAlt } }); }
export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const recipe = findRecipe(slug); if (!recipe) notFound();
  return <div className={styles.kitchen}><div className={styles.wrap}>
    <div className={styles.breadcrumb}><Link href="/kitchen">Pet Kitchen</Link> / {recipe.title}</div>
    <section className={styles.detailHero}><div><p className={styles.eyebrow}>{recipe.species.join(" + ")} · {recipe.kind}</p><h1>{recipe.title}</h1><p className={styles.deck}>{recipe.description}</p><dl className={styles.facts}><div><dt>Cooking cue</dt><dd>{recipe.timeLabel}</dd></div><div><dt>Ingredients</dt><dd>{recipe.ingredientCount}, including water</dd></div><div><dt>For</dt><dd>Healthy adult {recipe.species.join(" & ").toLowerCase()}</dd></div></dl><RecipeTools title={recipe.title} slug={recipe.slug} image={recipe.image} /></div><div><Image src={recipe.image} alt={recipe.imageAlt} width={1200} height={900} unoptimized priority /><p className={styles.imageNote}>AI-generated illustration. Preparation shown, not a serving-size guide. This method has not been kitchen-tested by The Pet Club.</p></div></section>
    <aside className={styles.notice}><strong>Before you start:</strong> {recipe.caution} These are occasional extras, not complete meals. Check with your veterinarian before offering them to a pet with a medical condition, food allergy or prescribed diet, or to a puppy or kitten.</aside>
    <div className={styles.recipeBody} id="recipe"><aside className={styles.ingredients}><h2>What you need</h2><ul>{recipe.ingredients.map(item => <li key={item}>{item}</li>)}</ul><p className={styles.imageNote}>Makes a preparation batch, not one serving. Cooking time is a guide; use the texture or temperature check in the method.</p></aside><div><h2>A small moment, made simply.</h2><ol className={styles.steps}>{recipe.steps.map(step => <li key={step}>{step}</li>)}</ol><h3>Offer a little, not the whole batch</h3><p className={styles.bodyText}>{recipe.serving}</p><h3>Keep the rest safely</h3><p className={styles.bodyText}>{recipe.storage}</p><h3>Leave these out</h3><p className={styles.bodyText}>{recipe.avoid}</p></div></div>
    <div className={styles.sources}><strong>Sources & editorial notes</strong><p>Reviewed October 22, 2026. General information for healthy adult pets, not veterinary formulation or medical advice. No invented calorie values, ratings or tested-recipe claims.</p><ul>{recipe.sources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul></div>
    <div className={styles.related}><Link href="/kitchen">← Back to the little-spoonful collection</Link>{" · "}<Link href="/food">Everyday food & nutrition</Link></div>
    <JsonLd schema={{ "@context": "https://schema.org", "@type": "Article", headline: recipe.title, description: recipe.description, url: `https://thepetclub.ca/kitchen/${recipe.slug}`, image: `https://thepetclub.ca${recipe.image}`, datePublished: "2026-10-22", dateModified: "2026-10-22", author: { "@type": "Organization", name: "The Pet Club" }, about: "Supplemental cooked pet treats; not a complete diet" }} />
  </div></div>;
}
