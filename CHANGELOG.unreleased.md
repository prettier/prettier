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

[#5804]: https://github.com/prettier/prettier/pull/5804
[@kachkaev]: https://github.com/kachkaev
