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

- TypeScript: Revert "Update typescript-estree to new package name" ([#5818] by [@ikatyang])

  There's an internal change introduced in Prettier 1.16.2,
  which updated `typescript-estree` to its new package name,
  but unfortunately it broke the output
  so we reverted it as a temporary workaround for now.

  <!-- prettier-ignore -->
  ```ts
  // Input
  export default {
    load<K, T>(k: K, t: T) {
      return {k, t};
    }
  }

  // Output (Prettier 1.16.2)
  export default {
    load(k: K, t: T) {
      return { k, t };
    }
  };

  // Output (Prettier 1.16.3)
  export default {
    load<K, T>(k: K, t: T) {
      return { k, t };
    }
  };
  ```
