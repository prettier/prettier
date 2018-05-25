---
id: browser
title: Browser
---

Run Prettier in the browser with the `standalone.js` UMD bundle shipped in the NPM package (starting in version 1.13). The new UMD bundle only formats the code and has no support for config and ignore files, no CLI usage and doesn't load plugins automatically.

### `prettier.format(code, options)`

Differently than the `format` function from the [main API](api.md#prettierformatsource-options), this function does not load plugins automatically, so a `plugins` property is required if you want to load external plugins. This also means the parsers included in the Prettier package won't be loaded automatically, so you need to load them before using.

See [Usage](browser.md#usage) below for examples.

## Usage

### Global

<!-- prettier-ignore -->
```html
<script src="https://unpkg.me/prettier@1.13.0/standalone.js"></script>
<script src="https://unpkg.me/prettier@1.13.0/parser-graphql.js"></script>
<script type="text/javascript">
prettier.format("query { }", { parser: "graphql", plugins: prettierPlugins });
</script>
```

### AMD

```js
define([
  "https://unpkg.me/prettier@1.13.0/standalone.js",
  "https://unpkg.me/prettier@1.13.0/parser-graphql.js"
], (prettier, ...plugins) => {
  prettier.format("query { }", { parser: "graphql", plugins });
});
```

### CJS

```js
const prettier = require("prettier/standalone");
const plugins = [require("prettier/parser-graphql")];
prettier.format("query { }", { parser: "graphql", plugins });
```

This syntax doesn't necessarily works in the browser but this can be used when bundling the code with browserify or Rollup.

### Worker

```js
importScripts("https://unpkg.me/prettier@1.13.0/standalone.js");
importScripts("https://unpkg.me/prettier@1.13.0/parser-graphql.js");
prettier.format("query { }", { parser: "graphql", plugins: prettierPlugins });
```
