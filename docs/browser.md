---
id: browser
title: Browser
---

Run Prettier in the browser using its **standalone** version. This version doesn’t depend on Node.js. It only formats the code and has no support for config files, ignore files, CLI usage, or automatic loading of plugins.

The standalone version comes as:

- ES modules: `standalone.mjs`, starting in version 3.0 (In version 2, `esm/standalone.mjs`.)
- UMD: `standalone.js`, starting in version 1.13

The [`browser` field](https://github.com/defunctzombie/package-browser-field-spec) in Prettier’s `package.json` points to `standalone.js`. That’s why you can just `import` or `require` the `prettier` module to access Prettier’s API, and your code can stay compatible with both Node and the browser as long as webpack or another bundler that supports the `browser` field is used. This is especially convenient for [plugins](plugins.md).

### `prettier.format(code, options)`

Required options:

- **[`parser`](options.md#parser) (or [`filepath`](options.md#file-path))**: One of these options has to be specified for Prettier to know which parser to use.

- **`plugins`**: Unlike the `format` function from the [Node.js-based API](api.md#prettierformatsource--options), this function doesn’t load plugins automatically. The `plugins` option is required because all the parsers included in the Prettier package come as plugins (for reasons of file size). These plugins are files in <https://unpkg.com/browse/prettier@2.8.4/plugins/>

  You need to load the ones that you’re going to use and pass them to `prettier.format` using the `plugins` option.

See below for examples.

## Usage

### Global

```html
<script src="https://unpkg.com/prettier@2.8.4/standalone.js"></script>
<script src="https://unpkg.com/prettier@2.8.4/plugins/graphql.js"></script>
<script>
  (async () => {
    const formatted = await prettier.format("type Query { hello: String }", {
      parser: "graphql",
      plugins: prettierPlugins,
    });
  })();
</script>
```

Note that the [`unpkg` field](https://unpkg.com/#examples) in Prettier’s `package.json` points to `standalone.js`, that’s why `https://unpkg.com/prettier` can also be used instead of `https://unpkg.com/prettier/standalone.js`.

### ES Modules

```html
<script type="module">
  import * as prettier from "https://unpkg.com/prettier@2.8.4/standalone.mjs";
  import pluginGraphql from "https://unpkg.com/prettier@2.8.4/plugins/graphql.mjs";

  const formatted = await prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins: [pluginGraphql],
  });
</script>
```

### AMD

```js
define([
  "https://unpkg.com/prettier@2.8.4/standalone.js",
  "https://unpkg.com/prettier@2.8.4/plugins/graphql.js",
], async (prettier, ...plugins) => {
  const formatted = await prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins,
  });
});
```

### CommonJS

```js
const prettier = require("prettier/standalone");
const plugins = [require("prettier/plugins/graphql")];
(async () => {
  const formatted = await prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins,
  });
})();
```

This syntax doesn’t necessarily work in the browser, but it can be used when bundling the code with browserify, Rollup, webpack, or another bundler.

### Worker

```js
importScripts("https://unpkg.com/prettier@2.8.4/standalone.js");
importScripts("https://unpkg.com/prettier@2.8.4/plugins/graphql.js");
(async () => {
  const formatted = await prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins: prettierPlugins,
  });
})();
```

## Parser plugins for embedded code

If you want to format [embedded code](options.md#embedded-language-formatting), you need to load related plugins too. For example:

```html
<script type="module">
  import * as prettier from "https://unpkg.com/prettier@2.8.4/standalone.mjs";
  import pluginBabel from "https://unpkg.com/prettier@2.8.4/plugins/babel.mjs";

  console.log(
    await prettier.format("const html=/* HTML */ `<DIV> </DIV>`", {
      parser: "babel",
      plugins: [pluginBabel],
    })
  );
  // Output: const html = /* HTML */ `<DIV> </DIV>`;
</script>
```

The HTML code embedded in JavaScript stays unformatted because the `html` parser hasn’t been loaded. Correct usage:

```html
<script type="module">
  import * as prettier from "https://unpkg.com/prettier@2.8.4/standalone.mjs";
  import pluginBabel from "https://unpkg.com/prettier@2.8.4/plugins/babel.mjs";
  import pluginHtml from "https://unpkg.com/prettier@2.8.4/plugins/html.mjs";

  console.log(
    await prettier.format("const html=/* HTML */ `<DIV> </DIV>`", {
      parser: "babel",
      plugins: [pluginBabel, pluginHtml],
    })
  );
  // Output: const html = /* HTML */ `<div></div>`;
</script>
```

## Builtin Plugins & Parsers

Available parsers:

- `babel`

  For JavaScript code.

  Lives in [`plugins/babel.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/babel.mjs) and [`plugins/babel.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/babel.js).

  Possible embedded parsers:

  - `html`
  - `scss`
  - `markdown`
  - `graphql`

- `babel-flow`

  Same as `babel` parser, but for Flow syntax.

- `babel-ts`

  Same as `babel` parser, but for TypeScript syntax.

- `flow`

  Same as `babel` parser, but for Flow syntax.

  Lives in [`plugins/flow.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/flow.mjs) and [`plugins/flow.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/flow.js).

- `typescript`

  Same as `babel` parser, but for TypeScript syntax.

  Lives in [`plugins/typescript.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/typescript.mjs) and [`plugins/typescript.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/typescript.js).

- `acorn`

  Same as `babel` parser.

  Lives in [`plugins/acorn-and-espree.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/acorn-and-espree.mjs) and [`plugins/acorn-and-espree.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/acorn-and-espree.js).

- `espree`

  Same as `babel` parser.

  Lives in [`plugins/acorn-and-espree.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/acorn-and-espree.mjs) and [`plugins/acorn-and-espree.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/acorn-and-espree.js).

- `meriyah`

  Same as `babel` parser.

  Lives in [`plugins/meriyah.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/meriyah.mjs) and [`plugins/meriyah.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/meriyah.js).

- `css`

  For CSS code.

  Lives in [`plugins/postcss.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/postcss.mjs) and [`plugins/postcss.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/postcss.js).

  Possible embedded parsers:

  - `markdown` - For Front Matter support.

- `scss`

  Same as `css` parser, but for SCSS code.

- `less`

  Same as `css` parser, but for LESS code.

- `json`

  For JSON code.

  Lives in [`plugins/babel.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/babel.mjs) and [`plugins/babel.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/babel.js) (it uses babel to parse).

- `json5`

  Same as `json` parser.

- `json5-stringify`

  Same as `json` parser.

- `graphql`

  For Graphql code.

  Lives in [`plugins/graphql.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/graphql.mjs) and [`plugins/graphql.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/graphql.js).

- `markdown`

  For MarkDown code.

  Lives in [`plugins/markdown.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/markdown.mjs) and [`plugins/markdown.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/markdown.js).

  It's possible to call any parser, since code blocks can have any language.

- `mdx`

  Same as `markdown` parser, but for MDX syntax.

- `html`

  For HTML code.

  Lives in [`plugins/html.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/html.mjs) and [`plugins/html.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/html.js).

  Possible embedded parsers:

  - `markdown` - For Front Matter support.
  - `css`, `scss`, `less` - Format `<style>` element and `style` attribute.
  - All JavaScript, Flow, TypeScript parsers - Format `<script>` element and interpolation.

- `vue`

  Same as `html` parser, but for Vue syntax.

  It's possible to call any parser, since Vue SFC supports custom blocks.

- `angular`

  Same as `html` parser, but for Angular syntax.

  Extra embedded parsers:

  - `__ng_action`
  - `__ng_binding`
  - `__ng_interpolation`
  - `__ng_directive`

  Those parsers are private, lives in [`plugins/angular.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/angular.mjs) and [`plugins/angular.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/angular.js).
  <!-- TODO: Mention the printers are in JavaScript plugins, when we fix #13256 -->

- `lwc`

  Same as `html` parser, but for LWC syntax.

- `yaml`

  For YAML code.

  Lives in [`plugins/yaml.mjs`](https://unpkg.com/browse/prettier@2.8.4/plugins/yaml.mjs) and [`plugins/yaml.js`](https://unpkg.com/browse/prettier@2.8.4/plugins/yaml.js).

  Possible embedded parsers:

  - `json` - We format some YAML files like JSON.
