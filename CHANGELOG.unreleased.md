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

- JavaScript: Do not format functions with arguments as react hooks ([#5778] by [@SimenB])

  The formatting added in Prettier 1.16 would format any function receiving an
  arrow function and an array literal to match React Hook's documentation.
  Prettier will now format this the same as before that change if the arrow
  function receives any arguments.

  <!-- prettier-ignore -->
  ```js
  // Input
  ["red", "white", "blue", "black", "hotpink", "rebeccapurple"].reduce(
    (allColors, color) => {
      return allColors.concat(color);
    },
    []
  );

  // Output (Prettier stable)
  ["red", "white", "blue", "black", "hotpink", "rebeccapurple"].reduce((
    allColors,
    color
  ) => {
    return allColors.concat(color);
  }, []);

  // Output (Prettier master)
  ["red", "white", "blue", "black", "hotpink", "rebeccapurple"].reduce(
    (allColors, color) => {
      return allColors.concat(color);
    },
    []
  );
  ```

[@simenb]: https://github.com/SimenB
[#5778]: https://github.com/prettier/prettier/pull/5778
