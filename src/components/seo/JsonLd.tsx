/* Emits a schema.org JSON-LD block. Works in server and client components;
   the `<` escape keeps any user-facing text from closing the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
