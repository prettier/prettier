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

- MDX: correctly recognize inline JSX ([#5783] by [@ikatyang])

  Previously, some inline JSXs are wrongly recognized as block HTML/JSX,
  which causes unexpected behaviors. This issue is now fixed.

  <!-- prettier-ignore -->
  ```md
  <!-- Input -->
  _foo <InlineJSX /> bar_

  <!-- Output (Prettier stable) -->
  _foo

  <InlineJSX /> bar_

  <!-- Output (Prettier master) -->
  _foo <InlineJSX /> bar_
  ```

[@ikatyang]: https://github.com/ikatyang
[#5783]: https://github.com/prettier/prettier/pull/5783
