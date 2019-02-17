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

- CLI: Honor stdin-filepath when outputting error messages.

- Markdown: Do not align table contents if it exceeds the print width and `--prose-wrap never` is set ([#5701] by [@chenshuai2144])

  The aligned table is less readable than the compact one
  if it's particularly long and the word wrapping is not enabled in the editor
  so we now print them as compact tables in these situations.

  <!-- prettier-ignore -->
  ```md
  <!-- Input -->
  | Property | Description | Type | Default |
  | -------- | ----------- | ---- | ------- |
  | bordered | Toggles rendering of the border around the list | boolean | false |
  | itemLayout | The layout of list, default is `horizontal`, If a vertical list is desired, set the itemLayout property to `vertical` | string | - |

  <!-- Output (Prettier stable, --prose-wrap never) -->
  | Property   | Description                                                                                                           | Type    | Default |
  | ---------- | --------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
  | bordered   | Toggles rendering of the border around the list                                                                       | boolean | false   |
  | itemLayout | The layout of list, default is `horizontal`, If a vertical list is desired, set the itemLayout property to `vertical` | string  | -       |

  <!-- Output (Prettier master, --prose-wrap never) -->
  | Property | Description | Type | Default |
  | --- | --- | --- | --- |
  | bordered | Toggles rendering of the border around the list | boolean | false |
  | itemLayout | The layout of list, default is `horizontal`, If a vertical list is desired, set the itemLayout property to `vertical` | string | - |
  ```

- LWC: Add support for Lightning Web Components ([#5800] by [@ntotten])

  Supports [Lightning Web Components (LWC)](https://developer.salesforce.com/docs/component-library/documentation/lwc) template format for HTML attributes by adding a new parser called `lwc`.

  <!-- prettier-ignore -->
  ```html
  // Input
  <my-element data-for={value}></my-element>

  // Output (Prettier stable)
  <my-element data-for="{value}"></my-element>

  // Output (Prettier master)
  <my-element data-for={value}></my-element>
  ```

- JavaScript: Fix parens logic for optional chaining expressions and closure type casts ([#5843] by [@yangsu])

  Logic introduced in #4542 will print parens in the wrong places and produce invalid code for optional chaining expressions (with more than 2 nodes) or closure type casts that end in function calls.

  <!-- prettier-ignore -->
  ```js
  // Input
  (a?.b[c]).c();
  let value = /** @type {string} */ (this.members[0]).functionCall();

  // Output (Prettier stable)
  a(?.b[c]).c();
  let value = /** @type {string} */ this(.members[0]).functionCall();

  // Output (Prettier master)
  (a?.b[c]).c();
  let value = /** @type {string} */ (this.members[0]).functionCall();
  ```
