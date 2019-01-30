<!--

Format:

- Category: Title ([#PR] by [@user])

  Description

  ```
  // Input
  Code Sample

  // Output (Prettier stable)
  Code Sample

  // Output (Prettier master)
  Code Sample
  ```

Details:

  Description: optional if the `Title` is enough to explain everything.

Examples:

- TypeScript: Correctly handle `//` in TSX ([#5728] by [@JamesHenry])

  Previously, putting `//` as a child of a JSX element in TypeScript led to an error
  because it was interpreted as a comment. Prettier master fixes this issue.

  <!-- prettier-ignore --\>
  ```js
  // Input
  const link = <a href="example.com">http://example.com</a>

  // Output (Prettier stable)
  // Error: Comment location overlaps with node location

  // Output (Prettier master)
  const link = <a href="example.com">http://example.com</a>;
  ```

-->

- CLI: Fix CI detection to avoid unwanted TTY behavior ([#5804] by [@kachkaev])

  In Prettier 1.16.0 and 1.16.1, `--list-different` and `--check` logged every file in some CI environments, instead of just unformatted files.
  This unwanted behavior is now fixed.

- HTML: Do not format non-normal whitespace as normal whitespace ([#5797] by [@ikatyang])

  Previously, only non-breaking whitespaces (U+00A0) are marked as non-normal whitespace,
  which means other non-normal whitespaces such as non-breaking narrow whitespaces (U+202F)
  could be formatted as normal whitespaces, which breaks the output. We now follow the spec to
  exclude all non-[ASCII whitespace](https://infra.spec.whatwg.org/#ascii-whitespace) from whitespace normalization.

  (`·` represents a non-breaking narrow whitespace)

  <!-- prettier-ignore -->
  ```html
  <!-- Input -->
  Prix·:·32·€

  <!-- Output (Prettier stable) -->
  Prix : 32 €

  <!-- Output (Prettier master) -->
  Prix·:·32·€
  ```
