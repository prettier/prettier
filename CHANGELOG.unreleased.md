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

- JavaScript: Add necessary parentheses for decorators ([#5785] by [@ikatyang])

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

- MDX: Correctly recognize inline JSX ([#5783] by [@ikatyang])

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

- Markdown:Enable compact table when `--prose-wrap never` and the table width exceeds `printWidth` ([#5701] by [@chenshuai2144])

  When the table width is particularly large, the table processed by the prettier is not well read. Now he talks about tightening and reducing the width.

  ```md
  <!-- Input -->
  | Property | Description | Type | Default |
  | -------- | ----------- | ---- | ------- |
  | bordered | Toggles rendering of the border around the list | boolean | false |
  | itemLayout | The layout of list, default is `horizontal`, If a vertical list is desired, set the itemLayout property to `vertical` | string | - |

  <!-- Output (Prettier stable) -->

  | Property   | Description                                                                                                           | Type    | Default |
  | ---------- | --------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
  | bordered   | Toggles rendering of the border around the list                                                                       | boolean | false   |
  | itemLayout | The layout of list, default is `horizontal`, If a vertical list is desired, set the itemLayout property to `vertical` | string  | -       |

  <!-- Output (Prettier master) -->
  
  | Property | Description | Type | Default |
  | --- | --- | --- | --- |
  | bordered | Toggles rendering of the border around the list | boolean | false |
  | itemLayout | The layout of list, default is \`horizontal\`, If a vertical list is desired, set the itemLayout property to \`vertical\` | string | - |
  ```

[@ikatyang]: https://github.com/ikatyang
[@simenb]: https://github.com/SimenB
[@chenshuai2144]: https://github.com/chenshuai2144
[#5778]: https://github.com/prettier/prettier/pull/5778
[#5783]: https://github.com/prettier/prettier/pull/5783
[#5785]: https://github.com/prettier/prettier/pull/5785
[#5701]: https://github.com/prettier/prettier/pull/5701
