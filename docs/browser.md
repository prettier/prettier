---
id: browser
title: Browser
---

Run Prettier in the browser using its **standalone** version. This version only formats the code and has no support for config files, ignore files, CLI usage, or automatic loading of plugins.

The standalone version comes as:

- ES modules: `esm/standalone.mjs`, starting in version 2.2
- UMD: `standalone.js`, starting in version 1.13

The [`browser` field](https://github.com/defunctzombie/package-browser-field-spec) in Prettier’s `package.json` points to `standalone.js`. That’s why you can just `import` or `require` the `prettier` module to access Prettier’s API, and your code can stay compatible with both Node and the browser as long as webpack or another bundler that supports the `browser` field is used. This is especially convenient for [plugins](plugins.md).

### `prettier.format(code, options)`

Unlike the `format` function from the [main API](api.md#prettierformatsource--options), this function does not load plugins automatically, so a `plugins` property is required if you want to load [plugins](#plugins). Additionally, the parsers included in the Prettier package won’t be loaded automatically, so you need to load them as plugins before using them.

See [Usage](#usage) below for examples.

## Plugins

All available plugins are files named `parser-*.js` in <https://unpkg.com/browse/prettier@2.2.1/> and `parser-*.mjs` in <https://unpkg.com/browse/prettier@2.2.1/esm/>.

If you want format embed code, you need load related plugins too, for example

```html
<script type="module">
  import prettier from "https://unpkg.com/prettier@2.2.1/esm/standalone.mjs";
  import parserBabel from "https://unpkg.com/prettier@2.2.1/esm/parser-babel.mjs";

  prettier.format("const html = /* HTML */ `<DIV> </DIV>`", {
    parser: "babel",
    plugins: [parserBabel],
  });
</script>
```

the HTML code inside JavaScript code won't get formatted, because it requires `html` parser too, correct usage

```html
<script type="module">
  import prettier from "https://unpkg.com/prettier@2.2.1/esm/standalone.mjs";
  import parserBabel from "https://unpkg.com/prettier@2.2.1/esm/parser-babel.mjs";
  import parserHtml from "https://unpkg.com/prettier@2.2.1/esm/parser-html.mjs";

  prettier.format("const html = /* HTML */ `<DIV> </DIV>`", {
    parser: "babel",
    plugins: [parserBabel, parserHtml],
  });
</script>
```

## Usage

### Global

```html
<script src="https://unpkg.com/prettier@2.2.1/standalone.js"></script>
<script src="https://unpkg.com/prettier@2.2.1/parser-graphql.js"></script>
<script>
  prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins: prettierPlugins,
  });
</script>
```

Note that the [`unpkg` field](https://unpkg.com/#examples) in Prettier’s `package.json` points to `standalone.js`, that’s why `https://unpkg.com/prettier` can also be used instead of `https://unpkg.com/prettier/standalone.js`.

### ES Modules

```html
<script type="module">
  import prettier from "https://unpkg.com/prettier@2.2.1/esm/standalone.mjs";
  import parserGraphql from "https://unpkg.com/prettier@2.2.1/esm/parser-graphql.mjs";

  prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins: [parserGraphql],
  });
</script>
```

### AMD

```js
define([
  "https://unpkg.com/prettier@2.2.1/standalone.js",
  "https://unpkg.com/prettier@2.2.1/parser-graphql.js",
], (prettier, ...plugins) => {
  prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins,
  });
});
```

### CommonJS

```js
const prettier = require("prettier/standalone");
const plugins = [require("prettier/parser-graphql")];
prettier.format("type Query { hello: String }", {
  parser: "graphql",
  plugins,
});
```

This syntax doesn’t necessarily work in the browser, but it can be used when bundling the code with browserify, Rollup, webpack, or another bundler.

### Worker

```js
importScripts("https://unpkg.com/prettier@2.2.1/standalone.js");
importScripts("https://unpkg.com/prettier@2.2.1/parser-graphql.js");
prettier.format("type Query { hello: String }", {
  parser: "graphql",
  plugins: prettierPlugins,
});
```
