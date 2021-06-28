---
id: browser
title: Browser
---

Run Prettier in the browser using its **standalone** version. This version doesn’t depend on Node.js. It only formats the code and has no support for config files, ignore files, CLI usage, or automatic loading of plugins.

The standalone version comes as:

- ES modules: `esm/standalone.mjs`, starting in version 2.2
- UMD: `standalone.js`, starting in version 1.13

The [`browser` field](https://github.com/defunctzombie/package-browser-field-spec) in Prettier’s `package.json` points to `standalone.js`. That’s why you can just `import` or `require` the `prettier` module to access Prettier’s API, and your code can stay compatible with both Node and the browser as long as webpack or another bundler that supports the `browser` field is used. This is especially convenient for [plugins](plugins.md).

### `prettier.format(code, options)`

Required options:

- **[`parser`](options.md#parser) (or [`filepath`](options.md#file-path))**: One of these options has to be specified for Prettier to know which parser to use.

- **`plugins`**: Unlike the `format` function from the [Node.js-based API](api.md#prettierformatsource--options), this function doesn’t load plugins automatically. The `plugins` option is required because all the parsers included in the Prettier package come as plugins (for reasons of file size). These plugins are files named

  - `parser-*.js` in <https://unpkg.com/browse/prettier@2.2.1/> and
  - `parser-*.mjs` in <https://unpkg.com/browse/prettier@2.2.1/esm/>

  You need to load the ones that you’re going to use and pass them to `prettier.format` using the `plugins` option.

See below for examples.

## Usage

### Global

```html
<script src="https://unpkg.com/prettier@2.3.2/standalone.js"></script>
<script src="https://unpkg.com/prettier@2.3.2/parser-graphql.js"></script>
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
  import prettier from "https://unpkg.com/prettier@2.3.2/esm/standalone.mjs";
  import parserGraphql from "https://unpkg.com/prettier@2.3.2/esm/parser-graphql.mjs";

  prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins: [parserGraphql],
  });
</script>
```

### AMD

```js
define([
  "https://unpkg.com/prettier@2.3.2/standalone.js",
  "https://unpkg.com/prettier@2.3.2/parser-graphql.js",
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
importScripts("https://unpkg.com/prettier@2.3.2/standalone.js");
importScripts("https://unpkg.com/prettier@2.3.2/parser-graphql.js");
prettier.format("type Query { hello: String }", {
  parser: "graphql",
  plugins: prettierPlugins,
});
```

## Parser plugins for embedded code

If you want to format [embedded code](options.md#embedded-language-formatting), you need to load related plugins too. For example:

```html
<script type="module">
  import prettier from "https://unpkg.com/prettier@2.3.2/esm/standalone.mjs";
  import parserBabel from "https://unpkg.com/prettier@2.3.2/esm/parser-babel.mjs";

  console.log(
    prettier.format("const html=/* HTML */ `<DIV> </DIV>`", {
      parser: "babel",
      plugins: [parserBabel],
    })
  );
  // Output: const html = /* HTML */ `<DIV> </DIV>`;
</script>
```

The HTML code embedded in JavaScript stays unformatted because the `html` parser hasn’t been loaded. Correct usage:

```html
<script type="module">
  import prettier from "https://unpkg.com/prettier@2.3.2/esm/standalone.mjs";
  import parserBabel from "https://unpkg.com/prettier@2.3.2/esm/parser-babel.mjs";
  import parserHtml from "https://unpkg.com/prettier@2.3.2/esm/parser-html.mjs";

  console.log(
    prettier.format("const html=/* HTML */ `<DIV> </DIV>`", {
      parser: "babel",
      plugins: [parserBabel, parserHtml],
    })
  );
  // Output: const html = /* HTML */ `<div></div>`;
</script>
```
