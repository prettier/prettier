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

- JavaScript: Fix closure compiler typecasts ([#5947] by [@jridgewell])

  If a closing parenthesis follows after a typecast in an inner expression, the typecast would wrap everything to the that following parenthesis.

  <!-- prettier-ignore -->
  ```js
  // Input
  test(/** @type {!Array} */(arrOrString).length);
  test(/** @type {!Array} */((arrOrString)).length + 1);

  // Output (Prettier stable)
  test(/** @type {!Array} */ (arrOrString.length));
  test(/** @type {!Array} */ (arrOrString.length + 1));

  // Output (Prettier master)
  test(/** @type {!Array} */ (arrOrString).length);
  test(/** @type {!Array} */ (arrOrString).length + 1);
  ```
