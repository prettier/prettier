---
id: plugins
title: Plugins (Beta)
---

## IN BETA

> The plugin API is in a **beta** state as of Prettier 1.10 and the API may change in the next release!

Plugins are ways of adding new languages to Prettier. Prettier's own implementations of all languages are expressed using the plugin API. The core `prettier` package contains JavaScript and other web-focussed languages built in. For additional languages you'll need to install a plugin.

## Using Plugins

Plugins are automatically loaded if you have them installed in your `package.json`. Prettier plugin package names must start with `@prettier/plugin-` or `prettier-plugin-` to be registered.

If the plugin is unable to be found automatically, you can load them with:

* The [CLI](./cli.md), via the `--plugin` flag:

  ```bash
  prettier --write main.foo --plugin=./foo-plugin
  ```

  > Tip: You can pass multiple `--plugin` flags.

* Or the [API](./api.md), via the `plugins` field:

  ```js
  prettier.format("code", {
    parser: "foo",
    plugins: ["./foo-plugin"]
  });
  ```

## Official Plugins

* [`@prettier/plugin-python`](https://github.com/prettier/prettier-python)
* [`@prettier/plugin-php`](https://github.com/prettier/prettier-php)
* [`@prettier/plugin-swift`](https://github.com/prettier/prettier-swift)

## Community Plugins

* [`prettier-plugin-java`](https://github.com/thorbenvh8/prettier-java)
* [`iamsolankiamit/prettier-ruby`](https://github.com/iamsolankiamit/prettier-ruby)
* [`benjie/prettier-plugin-pg`](https://github.com/benjie/prettier-plugin-pg)

## Developing Plugins

Prettier plugins are regular JavaScript modules with three exports, `languages`, `parsers` and `printers`.

### `languages`

Languages is an array of language definitions that your plugin will contribute to Prettier. It can include all of the fields specified in [`prettier.getSupportInfo()`](./api.md#prettiergetsupportinfo-version).

It **must** include `name` and `parsers`.

```js
export const languages = [
  {
    // The language name
    name: "InterpretedDanceScript",
    // Parsers that can parse this language.
    // This can be built-in parsers, or parsers you have contributed via this plugin.
    parsers: ["dance-parse"]
  }
];
```

### `parsers`

Parsers convert code as a string into an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree).

The key must match the name in the `parsers` array from `languages`. The value contains a parse function, an AST format name, and two location extraction functions (`locStart` and `locEnd`).

```js
export const parsers = {
  "dance-parse": {
    parse,
    // The name of the AST that
    astFormat: "dance-ast",
    locStart,
    locEnd
  }
};
```

The signature of the `parse` function is:

```ts
function parse(text: string, parsers: object, options: object): AST;
```

The location extraction functions (`locStart` and `locEnd`) return the beginning and the end location of a given AST node:

```ts
function locStart(node: object): number;
```

### `printers`

Printers convert ASTs into a Prettier intermediate representation, also known as a Doc.

The key must match the `astFormat` that the parser produces. The value contains an object with a `print` function and (optionally) an `embed` function.

```js
export const printers = {
  "dance-ast": {
    print,
    embed
  }
};
```

Printing is a recursive process of coverting an AST node (represented by a path to that node) into a doc. The doc is constructed using the [builder commands](https://github.com/prettier/prettier/blob/master/commands.md):

```js
const { concat, join, line, ifBreak, group } = require("prettier").doc.builders;
```

The signature of the `print` function is:

```ts
function print(
  // Path to the AST node to print
  path: FastPath,
  options: object,
  // Recursively print a child node
  print: (path: FastPath) => Doc
): Doc;
```

Check out [prettier-python's printer](https://github.com/prettier/prettier-python/blob/034ba8a9551f3fa22cead41b323be0b28d06d13b/src/printer.js#L174) as an example.

Embedding refers to printing one language inside another. Examples of this are CSS-in-JS and Markdown code blocks. Plugins can switch to alternate languages using the `embed` function. Its signature is:

```ts
function embed(
  // Path to the current AST node
  path: FastPath,
  // Print a node with the current printer
  print: (path: FastPath) => Doc,
  // Parse and print some text using a different parser.
  // You should set `options.parser` to specify which parser to use.
  textToDoc: (text: string, options: object) => Doc,
  // Current options
  options: object
): Doc | null;
```

If you don't want to switch to a different parser, simply return `null` or `undefined`.

### Utility functions

A `util` module from prettier core is considered a private API and is not meant to be consumed by plugins. Instead, the `util-shared` module provides the following limited set of utility functions for plugins:

```ts
makeString(rawContent: string, enclosingQuote: string, unescapeUnnecessarEscapes: boolean): string;
getNextNonSpaceNonCommentCharacterIndex(text: string, node: object, options: object): number;
isNextLineEmptyAfterIndex(text: string, index: number): boolean;
isNextLineEmpty(text: string, node: object, options: object): boolean;
mapDoc(doc: object, callback: function): void;
```

## Testing Plugins

Since plugins can be resolved using relative paths, when working on one you can do:

```js
const prettier = require("prettier");
const code = "(add 1 2)";
prettier.format(code, {
  parser: "lisp",
  plugins: ["."]
});
```

This will resolve a plugin relative to the current working direcrory.
