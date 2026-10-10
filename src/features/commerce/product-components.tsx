import Link from "next/link";
import Image from "next/image";
import { AffiliateLink } from "./affiliate-link";
import { findAffiliateOffer } from "./offers";
import { approvedProductImage, findProduct, type Product } from "./products";
import { ProductLink } from "./product-link";

export function CommerceDisclosure() {
  return <p className="club-commerce-disclosure">
    We may earn a commission from purchases through these links. As an Amazon Associate I earn from qualifying purchases. <Link href="/advertising-disclosure">Our advertising policy</Link>.
  </p>;
}

function ProductAction({ product }: { product: Product }) {
  const offer = product.offerId ? findAffiliateOffer(product.offerId) : undefined;
  if (offer) return <div className="club-product-action"><AffiliateLink offer={offer} /></div>;
  return <ProductLink product={product} />;
}

function ProductPanel({ product }: { product: Product }) {
  const image = approvedProductImage(product);
  return <article className="club-product-panel">
    {image ? <div className="club-product-photo">
      <Image src={image.src} alt={image.alt} fill sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 560px" />
    </div> : null}
    <div className="club-product-content">
      {image?.credit ? <p className="club-product-image-credit">{image.credit}</p> : null}
      <span className="club-eyebrow">{product.activity}</span>
      <h3>{product.name}</h3>
      <p className="club-product-description">{product.use}</p>
      <ul className="club-product-features" aria-label={`${product.name} features`}>{product.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      <div className="club-product-considerations"><h4>Before you choose</h4><p>{product.considerations}</p></div>
      <ProductAction product={product} />
    </div>
  </article>;
}

export function ProductCard({ productId }: { productId: string }) {
  const product = findProduct(productId);
  if (!product) return null;
  return <aside aria-label={product.name} className="club-product-single my-8">
    <CommerceDisclosure />
    <ProductPanel product={product} />
    <p className="club-product-editorial-note">We have not tested these products. Listing checked {product.checkedOn}. Confirm price, stock, shipping and returns on the retailer’s site.</p>
  </aside>;
}

export function ProductComparison({ productIds }: { productIds: string[] }) {
  const entries = [...new Set(productIds)].map(findProduct).filter((item): item is Product => Boolean(item));
  if (entries.length < 2) return null;
  return <section aria-label="Cat enrichment product comparison" className="club-comparison my-8">
    <CommerceDisclosure />
    <p className="club-product-editorial-note">Retailer-listed features, not a ranking. We have not tested these products.</p>
    <div className="club-product-grid">{entries.map(product => <ProductPanel key={product.id} product={product} />)}</div>
    <details className="club-comparison-details"><summary>Compare the features side by side</summary>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable comparison table"><table className="min-w-[32rem]"><caption>Two different activities, rather than a best-product ranking</caption><thead><tr><th scope="col">Example</th><th scope="col">Activity and design</th><th scope="col">Before choosing</th></tr></thead><tbody>{entries.map(product => <tr key={product.id}><th scope="row">{product.name}</th><td>{product.use} {product.construction}</td><td>{product.considerations}</td></tr>)}</tbody></table></div>
    </details>
    <p className="text-caption text-foreground-muted mt-4">Listings checked {entries[0]?.checkedOn}. Check current price, stock, shipping and returns on the retailer’s site.</p>
  </section>;
}
