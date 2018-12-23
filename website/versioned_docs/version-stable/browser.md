---
id: version-stable-browser
title: Browser
original_id: browser
---

Run Prettier in the browser with the `standalone.js` UMD bundle shipped in the NPM package (starting in version 1.13). The new UMD bundle only formats the code and has no support for config files, ignore files, CLI usage, or automatic loading of plugins.

### `prettier.format(code, options)`

Unlike the `format` function from the [main API](api.md#prettierformatsource-options), this function does not load plugins automatically, so a `plugins` property is required if you want to load plugins. Additionally, the parsers included in the Prettier package won't be loaded automatically, so you need to load them before using them.

See [Usage](#usage) below for examples.

## Usage

### Global

<!-- prettier-ignore -->
```html
<script src="https://unpkg.com/prettier@1.13.0/standalone.js"></script>
<script src="https://unpkg.com/prettier@1.13.0/parser-graphql.js"></script>
<script type="text/javascript">
prettier.format("query { }", { parser: "graphql", plugins: prettierPlugins });
</script>
```

### AMD

```js
define([
  "https://unpkg.com/prettier@1.13.0/standalone.js",
  "https://unpkg.com/prettier@1.13.0/parser-graphql.js"
], (prettier, ...plugins) => {
  prettier.format("query { }", { parser: "graphql", plugins });
});
```

### CommonJS

```js
const prettier = require("prettier/standalone");
const plugins = [require("prettier/parser-graphql")];
prettier.format("query { }", { parser: "graphql", plugins });
```

This syntax doesn't necessarily work in the browser, but it can be used when bundling the code with browserify, Rollup, webpack, or another bundler.

### Worker

```js
importScripts("https://unpkg.com/prettier@1.13.0/standalone.js");
importScripts("https://unpkg.com/prettier@1.13.0/parser-graphql.js");
prettier.format("query { }", { parser: "graphql", plugins: prettierPlugins });
```
