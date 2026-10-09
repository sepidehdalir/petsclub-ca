"use client";
import type { Product } from "./products";

export function ProductLink({ product }: { product: Product }) {
  return <a href={product.source} rel="noopener" className="inline-flex min-h-11 items-center rounded-md bg-pine-700 px-4 py-3 text-body-sm font-semibold text-white hover:bg-pine-800 focus-visible:outline-2 focus-visible:outline-offset-4"
    onClick={() => window.dispatchEvent(new CustomEvent("thepetclub:product-click", { detail: { product_id: product.id } }))}>
    View retailer details<span className="sr-only"> for {product.name}</span>
  </a>;
}
