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

- API: Fix `prettier.getSupportInfo()` reporting babel parser for older versions of Prettier. ([#5826] by [@azz])

  In version `1.16.0` of Prettier, the `babylon` parser was renamed to `babel`. Unfortunately this lead to a minor breaking change: `prettier.getSupportInfo('1.15.0')` would report that it supported `babel`, not `babylon`, which breaks text-editor integrations. This has now been fixed.
