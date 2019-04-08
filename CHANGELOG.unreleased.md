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

- JavaScript: Respect newlines between parameters ([#5260] by [@evilebottnawi])

  <!-- prettier-ignore -->
  ```js
  // Input
  function foo(
    one,
  
    two,
    three,
    four,
  
  
    five,
    six,
    seven,
    eight,
    nine,
    ten,
  
    eleven
  
  ) {}
    
  // Output (Prettier stable)
  function foo(
    one,
    two,
    three,
    four,
    five,
    six,
    seven,
    eight,
    nine,
    ten,
    eleven
  ) {}
    
  // Output (Prettier master)
  function foo(
    one,
  
    two,
    three,
    four,
  
    five,
    six,
    seven,
    eight,
    nine,
    ten,
  
    eleven
  ) {}
  ```

- JavaScript: Fix multiline dynamic import comments ([#6025] by [@noahsug])

  <!-- prettier-ignore -->
  ```js
  // Input
  import(
    /* Hello */
    'something'
    /* Hello */
  )
  import(
    'myreallylongdynamicallyloadedmodulenamemyreallylongdynamicallyloadedmodulename'
  )

  // Output (Prettier stable)
  import(/* Hello */
  "something");
  /* Hello */
  import('myreallylongdynamicallyloadedmodulenamemyreallylongdynamicallyloadedmodulename');

  // Output (Prettier master)
  import(
    /* Hello */
    'something'
    /* Hello */
  )
  import(
    'myreallylongdynamicallyloadedmodulenamemyreallylongdynamicallyloadedmodulename'
  );
  ```

- JavaScript: Add parentheses for immediately-constructed fn/class ([#5996] by [@bakkot])

  <!-- prettier-ignore -->
  ```js
  // Input
  new class {};
  new function() {}

  // Output (Prettier stable)
  new class {}();
  new function() {}();

  // Output (Prettier master)
  new (class {})();
  new (function() {})();
  ```

- Config: Support shared configurations ([#5963] by [@azz])

  Sharing a Prettier configuration is simple: just publish a module that exports a configuration object, say `@company/prettier-config`, and reference it in your `package.json`:

  ```json
  {
    "name": "my-cool-library",
    "version": "9000.0.1",
    "prettier": "@company/prettier-config"
  }
  ```

  If you don't want to use `package.json`, you can use any of the supported extensions to export a string, e.g. `.prettierrc.json`:

  ```json
  "@company/prettier-config"
  ```

  An example configuration repository is available [here](https://github.com/azz/prettier-config).

  > Note: This method does **not** offer a way to _extend_ the configuration to overwrite some properties from the shared configuration. If you need to do that, import the file in a `.prettierrc.js` file and export the modifications, e.g:
  >
  > ```js
  > module.exports = {
  >   ...require("@company/prettier-config"),
  >   semi: false
  > };
  > ```

- JavaScript: Add an option to modify when Prettier quotes object properties ([#5934] by [@azz])
  **`--quote-props <as-needed|preserve|consistent>`**

  `as-needed` **(default)** - Only add quotes around object properties where required. Current behaviour.
  `preserve` - Respect the input. This is useful for users of Google's Closure Compiler in Advanced Mode, which treats quoted properties differently.
  `consistent` - If _at least one_ property in an object requires quotes, quote all properties - this is like ESLint's [`consistent-as-needed`](https://eslint.org/docs/rules/quote-props) option.

  <!-- prettier-ignore -->
  ```js
  // Input
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "origin": "prettier.io"
  };

  // Output --quote-props=as-needed
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    origin: "prettier.io"
  };

  // Output --quote-props=consistent
  const headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "origin": "prettier.io"
  };

  // Output --quote-props=preserve
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "origin": "prettier.io"
  };
  ```

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

- CLI: Plugins published as a scoped NPM package (e.g.: `@name/prettier-plugin-foo`) are now automatically registered ([#5945] by [@Kocal])

- Angular: Don't add unnecessary parentheses to pipes ([#5929] by [@voithos])

  In some cases, wrapping parentheses were being added to certain pipes inside attributes, but they are no longer added when they don't affect the result of the expression.

  <!-- prettier-ignore -->
  ```html
  // Input
  <div *ngIf="isRendered | async"></div>

  // Output (Prettier stable)
  <div *ngIf="(isRendered | async)"></div>

  // Output (Prettier master)
  <div *ngIf="isRendered | async"></div>
  ```

- TypeScript: Support `readonly` operator ([#6027] by [@ikatyang])

  <!-- prettier-ignore -->
  ```ts
  // Input
  declare const array: readonly number[];

  // Output (Prettier stable)
  // SyntaxError: ',' expected.

  // Output (Prettier master)
  declare const array: readonly number[];
  ```

- GraphQL: Support variable directives ([#6020] by [@adek05])

  Upgrading to graphql-js 14.0 enables new GraphQL language feature - variable directives. Support for printing them is added along with the graphql-js version bump.

  <!-- prettier-ignore -->
  ```
  // Input
  query Q($variable: Int   @directive) {node}

  // Output (Prettier stable)
  query Q($variable: Int) {
    node
  }

  // Output (Prettier master)
  query Q($variable: Int @directive) {
    node
  }
  ```

- GraphQL: Support GraphQL fragment variables ([#6016] by [@adek05])

  ```
  // Input
  fragment F($var: Int) on Type { node }

  // Output (Prettier stable)
  // Fails to parse

  // Output (Prettier master)
  fragment F($var: Int) on Type {
     node
  }
  ```
