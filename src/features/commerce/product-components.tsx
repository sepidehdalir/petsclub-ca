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
  if (offer) return <div><p className="text-body-sm">{offer.disclosure}</p><AffiliateLink offer={offer} /></div>;
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
  return <section aria-label="Cat enrichment product comparison" className="my-8">
    <CommerceDisclosure />
    <div className="overflow-x-auto rounded-md border border-border" tabIndex={0} role="region" aria-label="Scrollable comparison table">
      <table className="min-w-[36rem]">
        <caption className="p-3 text-left font-semibold">Two different activities, rather than a best-product ranking</caption>
        <thead><tr><th scope="col">Example</th><th scope="col">Activity and design</th><th scope="col">Before choosing</th></tr></thead>
        <tbody>{entries.map((product) => <tr key={product.id}>
          <th scope="row">{product.name}<div className="mt-3"><ProductAction product={product} /></div></th>
          <td>{product.use} {product.construction}</td><td>{product.considerations}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="text-body-sm text-foreground-muted">Listings checked {entries[0]?.checkedOn}. Check current price, stock, shipping and returns on the retailer’s site.</p>
  </section>;
}
