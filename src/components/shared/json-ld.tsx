import type { JsonLdSchema } from "@/lib/seo/structured-data";

export interface JsonLdProps {
  schema: JsonLdSchema | readonly JsonLdSchema[];
}

/**
 * Emits Schema.org JSON-LD.
 *
 * `dangerouslySetInnerHTML` is unavoidable for a `<script type="application/ld+json">`
 * block, so the input is constrained: it is always the output of a typed
 * builder in `lib/seo/structured-data`, never user-supplied content, and it is
 * serialised with `JSON.stringify`. `<` is additionally escaped so a future
 * value containing `</script>` cannot break out of the element.
 */
export function JsonLd({ schema }: JsonLdProps) {
  const payload = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
