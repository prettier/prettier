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

- JavaScript: add necessary parentheses for decorators ([#5785] by [@ikatyang])

  Parentheses for decorators with nested call expressions are optional for legacy decorators
  but they're required for decorators in the current [proposal](https://tc39.github.io/proposal-decorators/#sec-syntax).

  <!-- prettier-ignore -->
  ```js
  // Input
  class X {
    @(computed().volatile())
    prop
  }

   // Output (Prettier stable)
  class X {
    @computed().volatile()
    prop
  }

   // Output (Prettier master)
  class X {
    @(computed().volatile())
    prop
  }
  ```

[@ikatyang]: https://github.com/ikatyang
[#5785]: https://github.com/prettier/prettier/pull/5785
