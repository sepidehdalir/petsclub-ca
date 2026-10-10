import Link from "next/link";
import { AffiliateLink } from "./affiliate-link";
import { findAffiliateOffer } from "./offers";
import { findProduct, type Product } from "./products";
import { ProductLink } from "./product-link";

export function CommerceDisclosure() {
  return <p className="text-body-sm text-foreground-muted">
    These examples compare retailer-listed features. We have not tested these products. We may earn a commission when you use a disclosed affiliate link and make a qualifying purchase. Ordinary source links earn us no commission. As an Amazon Associate I earn from qualifying purchases. <Link href="/advertising-disclosure" className="underline">Our advertising policy</Link>.
  </p>;
}

function ProductAction({ product }: { product: Product }) {
  const offer = product.offerId ? findAffiliateOffer(product.offerId) : undefined;
  if (offer) return <div className="club-product-action"><AffiliateLink offer={offer} /></div>;
  return <ProductLink product={product} />;
}

export function ProductCard({ productId }: { productId: string }) {
  const product = findProduct(productId);
  if (!product) return null;
  return <aside aria-label={product.name} className="my-8 rounded-card border border-border bg-surface-muted p-5">
    <CommerceDisclosure />
    <h3>{product.name}</h3>
    <p>{product.use} {product.construction}</p>
    <p>{product.considerations}</p>
    <ProductAction product={product} />
    <p className="mt-3 text-body-sm text-foreground-muted">Listing checked {product.checkedOn}. Confirm current price, stock, shipping and returns before buying. There is no need to buy every example.</p>
  </aside>;
}

export function ProductComparison({ productIds }: { productIds: string[] }) {
  const entries = [...new Set(productIds)].map(findProduct).filter((item): item is Product => Boolean(item));
  if (entries.length < 2) return null;
  return <section aria-label="Cat enrichment product comparison" className="club-comparison my-8">
    <CommerceDisclosure />
    <div className="club-product-grid">{entries.map((product, index) => <article key={product.id} className="club-product-panel">
      <div className="club-product-heading"><span className="club-eyebrow">{index === 0 ? "Food exploration" : "Chase & play"}</span><span aria-hidden="true" className="club-product-number">0{index + 1}</span></div>
      <h3>{product.name}</h3>
      <p>{product.use}</p>
      <dl><div><dt>How it works</dt><dd>{product.construction}</dd></div><div><dt>Before choosing</dt><dd>{product.considerations}</dd></div></dl>
      <ProductAction product={product} />
    </article>)}</div>
    <details className="club-comparison-details"><summary>Compare the features side by side</summary>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable comparison table"><table className="min-w-[32rem]"><caption>Two different activities, rather than a best-product ranking</caption><thead><tr><th scope="col">Example</th><th scope="col">Activity and design</th><th scope="col">Before choosing</th></tr></thead><tbody>{entries.map(product => <tr key={product.id}><th scope="row">{product.name}</th><td>{product.use} {product.construction}</td><td>{product.considerations}</td></tr>)}</tbody></table></div>
    </details>
    <p className="text-caption text-foreground-muted mt-4">Listings checked {entries[0]?.checkedOn}. Check current price, stock, shipping and returns on the retailer’s site.</p>
  </section>;
}
