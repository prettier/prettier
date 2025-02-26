---
id: browser
title: Browser
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Run Prettier in the browser using its **standalone** version. This version doesn’t depend on Node.js. It only formats the code and has no support for config files, ignore files, CLI usage, or automatic loading of plugins.

The standalone version comes as:

- ES modules: `standalone.mjs`, starting in version 3.0 (In version 2, `esm/standalone.mjs`.)
- UMD: `standalone.js`, starting in version 1.13

The [`browser` field](https://github.com/defunctzombie/package-browser-field-spec) in Prettier’s `package.json` points to `standalone.js`. That’s why you can just `import` or `require` the `prettier` module to access Prettier’s API, and your code can stay compatible with both Node and the browser as long as webpack or another bundler that supports the `browser` field is used. This is especially convenient for [plugins](plugins.md).

### `prettier.format(code, options)`

Required options:

- **[`parser`](options.md#parser) (or [`filepath`](options.md#file-path))**: One of these options has to be specified for Prettier to know which parser to use.

- **`plugins`**: Unlike the `format` function from the [Node.js-based API](api.md#prettierformatsource-options), this function doesn’t load plugins automatically. The `plugins` option is required because all the parsers included in the Prettier package come as plugins (for reasons of file size). These plugins are files in [https://unpkg.com/browse/prettier@%PRETTIER_VERSION%/plugins](https://unpkg.com/browse/prettier@%PRETTIER_VERSION%/plugins). Note that `estree` plugin should be loaded when printing JavaScript, TypeScript, Flow, or JSON.

  You need to load the ones that you’re going to use and pass them to `prettier.format` using the `plugins` option.

See below for examples.

## Usage

### Global

```html
<script src="https://unpkg.com/prettier@%PRETTIER_VERSION%/standalone.js"></script>
<script src="https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/graphql.js"></script>
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
  import * as prettier from "https://unpkg.com/prettier@%PRETTIER_VERSION%/standalone.mjs";
  import * as prettierPluginGraphql from "https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/graphql.mjs";

  const formatted = await prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins: [prettierPluginGraphql],
  });
</script>
```

### AMD

```js
define([
  "https://unpkg.com/prettier@%PRETTIER_VERSION%/standalone.js",
  "https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/graphql.js",
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

<Tabs groupId="worker-type">
<TabItem value="module" label="Module worker">

```js
import * as prettier from "https://unpkg.com/prettier@%PRETTIER_VERSION%/standalone.mjs";
import * as prettierPluginGraphql from "https://unpkg.com/prettier@%PRETTIER_VERSION%1/plugins/graphql.mjs";

const formatted = await prettier.format("type Query { hello: String }", {
  parser: "graphql",
  plugins: [prettierPluginGraphql],
});
```

</TabItem>
<TabItem value="classic" label="Classic worker">

```js
importScripts(
  "https://unpkg.com/prettier@%PRETTIER_VERSION%/standalone.js",
  "https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/graphql.js",
);

(async () => {
  const formatted = await prettier.format("type Query { hello: String }", {
    parser: "graphql",
    plugins: prettierPlugins,
  });
})();
```

</TabItem>
</Tabs>

## Parser plugins for embedded code

If you want to format [embedded code](options.md#embedded-language-formatting), you need to load related plugins too. For example:

```html
<script type="module">
  import * as prettier from "https://unpkg.com/prettier@%PRETTIER_VERSION%/standalone.mjs";
  import * as prettierPluginBabel from "https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/babel.mjs";
  import * as prettierPluginEstree from "https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/estree.mjs";

  console.log(
    await prettier.format("const html=/* HTML */ `<DIV> </DIV>`", {
      parser: "babel",
      plugins: [prettierPluginBabel, prettierPluginEstree],
    }),
  );
  // Output: const html = /* HTML */ `<DIV> </DIV>`;
</script>
```

The HTML code embedded in JavaScript stays unformatted because the `html` parser hasn’t been loaded. Correct usage:

```html
<script type="module">
  import * as prettier from "https://unpkg.com/prettier@%PRETTIER_VERSION%/standalone.mjs";
  import * as prettierPluginBabel from "https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/babel.mjs";
  import * as prettierPluginEstree from "https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/estree.mjs";
  import * as prettierPluginHtml from "https://unpkg.com/prettier@%PRETTIER_VERSION%/plugins/html.mjs";

  console.log(
    await prettier.format("const html=/* HTML */ `<DIV> </DIV>`", {
      parser: "babel",
      plugins: [prettierPluginBabel, prettierPluginEstree, prettierPluginHtml],
    }),
  );
  // Output: const html = /* HTML */ `<div></div>`;
</script>
```
