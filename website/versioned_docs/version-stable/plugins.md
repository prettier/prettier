---
id: version-stable-plugins
title: Plugins
original_id: plugins
---

Plugins are ways of adding new languages or formatting rules to Prettier. Prettier’s own implementations of all languages are expressed using the plugin API. The core `prettier` package contains JavaScript and other web-focused languages built in. For additional languages you’ll need to install a plugin.

## Using Plugins

You can load plugins with:

- The [CLI](cli.md), via `--plugin`:

  ```bash
  prettier --write main.foo --plugin=prettier-plugin-foo
  ```

  > Tip: You can set `--plugin` options multiple times.

- The [API](api.md), via the `plugins` options:

  ```js
  await prettier.format("code", {
    parser: "foo",
    plugins: ["prettier-plugin-foo"],
  });
  ```

- The [Configuration File](configuration.md):

  ```json
  {
    "plugins": ["prettier-plugin-foo"]
  }
  ```

Strings provided to `plugins` are ultimately passed to [`import()` expression](https://nodejs.org/api/esm.html#import-expressions), so you can provide a module/package name, a path, or anything else `import()` takes.

## Official Plugins

- [`@prettier/plugin-php`](https://github.com/prettier/plugin-php)
- [`@prettier/plugin-pug`](https://github.com/prettier/plugin-pug) by [**@Shinigami92**](https://github.com/Shinigami92)
- [`@prettier/plugin-ruby`](https://github.com/prettier/plugin-ruby)
- [`@prettier/plugin-xml`](https://github.com/prettier/plugin-xml)

## Community Plugins

- [`prettier-plugin-apex`](https://github.com/dangmai/prettier-plugin-apex) by [**@dangmai**](https://github.com/dangmai)
- [`prettier-plugin-astro`](https://github.com/withastro/prettier-plugin-astro) by [**@withastro contributors**](https://github.com/withastro/prettier-plugin-astro/graphs/contributors)
- [`prettier-plugin-elm`](https://github.com/gicentre/prettier-plugin-elm) by [**@giCentre**](https://github.com/gicentre)
- [`prettier-plugin-erb`](https://github.com/adamzapasnik/prettier-plugin-erb) by [**@adamzapasnik**](https://github.com/adamzapasnik)
- [`prettier-plugin-gherkin`](https://github.com/mapado/prettier-plugin-gherkin) by [**@mapado**](https://github.com/mapado)
- [`prettier-plugin-glsl`](https://github.com/NaridaL/glsl-language-toolkit/tree/main/packages/prettier-plugin-glsl) by [**@NaridaL**](https://github.com/NaridaL)
- [`prettier-plugin-go-template`](https://github.com/NiklasPor/prettier-plugin-go-template) by [**@NiklasPor**](https://github.com/NiklasPor)
- [`prettier-plugin-java`](https://github.com/jhipster/prettier-java) by [**@JHipster**](https://github.com/jhipster)
- [`prettier-plugin-jinja-template`](https://github.com/davidodenwald/prettier-plugin-jinja-template) by [**@davidodenwald**](https://github.com/davidodenwald)
- [`prettier-plugin-jsonata`](https://github.com/Stedi/prettier-plugin-jsonata) by [**@Stedi**](https://github.com/Stedi)
- [`prettier-plugin-kotlin`](https://github.com/Angry-Potato/prettier-plugin-kotlin) by [**@Angry-Potato**](https://github.com/Angry-Potato)
- [`prettier-plugin-motoko`](https://github.com/dfinity/prettier-plugin-motoko) by [**@dfinity**](https://github.com/dfinity)
- [`prettier-plugin-nginx`](https://github.com/joedeandev/prettier-plugin-nginx) by [**@joedeandev**](https://github.com/joedeandev)
- [`prettier-plugin-prisma`](https://github.com/umidbekk/prettier-plugin-prisma) by [**@umidbekk**](https://github.com/umidbekk)
- [`prettier-plugin-properties`](https://github.com/eemeli/prettier-plugin-properties) by [**@eemeli**](https://github.com/eemeli)
- [`prettier-plugin-rust`](https://github.com/jinxdash/prettier-plugin-rust) by [**@jinxdash**](https://github.com/jinxdash)
- [`prettier-plugin-sh`](https://github.com/un-ts/prettier/tree/master/packages/sh) by [**@JounQin**](https://github.com/JounQin)
- [`prettier-plugin-sql`](https://github.com/un-ts/prettier/tree/master/packages/sql) by [**@JounQin**](https://github.com/JounQin)
- [`prettier-plugin-sql-cst`](https://github.com/nene/prettier-plugin-sql-cst) by [**@nene**](https://github.com/nene)
- [`prettier-plugin-solidity`](https://github.com/prettier-solidity/prettier-plugin-solidity) by [**@mattiaerre**](https://github.com/mattiaerre)
- [`prettier-plugin-svelte`](https://github.com/sveltejs/prettier-plugin-svelte) by [**@sveltejs**](https://github.com/sveltejs)
- [`prettier-plugin-toml`](https://github.com/bd82/toml-tools/tree/master/packages/prettier-plugin-toml) by [**@bd82**](https://github.com/bd82)

## Developing Plugins

Prettier plugins are regular JavaScript modules with the following five exports or default export with the following properties:

- `languages`
- `parsers`
- `printers`
- `options`
- `defaultOptions`

### `languages`

Languages is an array of language definitions that your plugin will contribute to Prettier. It can include all of the fields specified in [`prettier.getSupportInfo()`](api.md#prettiergetsupportinfo).

It **must** include `name` and `parsers`.

```js
export const languages = [
  {
    // The language name
    name: "InterpretedDanceScript",
    // Parsers that can parse this language.
    // This can be built-in parsers, or parsers you have contributed via this plugin.
    parsers: ["dance-parse"],
  },
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
    hasPragma,
    locStart,
    locEnd,
    preprocess,
  },
};
```

The signature of the `parse` function is:

```ts
function parse(text: string, options: object): Promise<AST> | AST;
```

The location extraction functions (`locStart` and `locEnd`) return the starting and ending locations of a given AST node:

```ts
function locStart(node: object): number;
```

_(Optional)_ The pragma detection function (`hasPragma`) should return if the text contains the pragma comment.

```ts
function hasPragma(text: string): boolean;
```

_(Optional)_ The preprocess function can process the input text before passing into `parse` function.

```ts
function preprocess(text: string, options: object): string;
```

### `printers`

Printers convert ASTs into a Prettier intermediate representation, also known as a Doc.

The key must match the `astFormat` that the parser produces. The value contains an object with a `print` function. All other properties (`embed`, `preprocess`, etc.) are optional.

```js
export const printers = {
  "dance-ast": {
    print,
    embed,
    preprocess,
    getVisitorKeys,
    insertPragma,
    canAttachComment,
    isBlockComment,
    printComment,
    getCommentChildNodes,
    handleComments: {
      ownLine,
      endOfLine,
      remaining,
    },
  },
};
```

#### The printing process

Prettier uses an intermediate representation, called a Doc, which Prettier then turns into a string (based on options like `printWidth`). A _printer_'s job is to take the AST generated by `parsers[<parser name>].parse` and return a Doc. A Doc is constructed using [builder commands](https://github.com/prettier/prettier/blob/main/commands.md):

```js
import { doc } from "prettier";

const { join, line, ifBreak, group } = doc.builders;
```

The printing process consists of the following steps:

1. **AST preprocessing** (optional). See [`preprocess`](#optional-preprocess).
2. **Comment attachment** (optional). See [Handling comments in a printer](#handling-comments-in-a-printer).
3. **Processing embedded languages** (optional). The [`embed`](#optional-embed) method, if defined, is called for each node, depth-first. While, for performance reasons, the recursion itself is synchronous, `embed` may return asynchronous functions that can call other parsers and printers to compose docs for embedded syntaxes like CSS-in-JS. These returned functions are queued up and sequentially executed before the next step.
4. **Recursive printing**. A doc is recursively constructed from the AST. Starting from the root node:
   - If, from the step 3, there is an embedded language doc associated with the current node, this doc is used.
   - Otherwise, the `print(path, options, print): Doc` method is called. It composes a doc for the current node, often by printing child nodes using the `print` callback.

#### `print`

Most of the work of a plugin's printer will take place in its `print` function, whose signature is:

```ts
function print(
  // Path to the AST node to print
  path: AstPath,
  options: object,
  // Recursively print a child node
  print: (selector?: string | number | Array<string | number> | AstPath) => Doc,
): Doc;
```

The `print` function is passed the following parameters:

- **`path`**: An object, which can be used to access nodes in the AST. It’s a stack-like data structure that maintains the current state of the recursion. It is called “path” because it represents the path to the current node from the root of the AST. The current node is returned by `path.node`.
- **`options`**: A persistent object, which contains global options and which a plugin may mutate to store contextual data.
- **`print`**: A callback for printing sub-nodes. This function contains the core printing logic that consists of steps whose implementation is provided by plugins. In particular, it calls the printer’s `print` function and passes itself to it. Thus, the two `print` functions – the one from the core and the one from the plugin – call each other while descending down the AST recursively.

Here’s a simplified example to give an idea of what a typical implementation of `print` looks like:

```js
import { doc } from "prettier";

const { group, indent, join, line, softline } = doc.builders;

function print(path, options, print) {
  const node = path.node;

  switch (node.type) {
    case "list":
      return group([
        "(",
        indent([softline, join(line, path.map(print, "elements"))]),
        softline,
        ")",
      ]);

    case "pair":
      return group([
        "(",
        indent([softline, print("left"), line, ". ", print("right")]),
        softline,
        ")",
      ]);

    case "symbol":
      return node.name;
  }

  throw new Error(`Unknown node type: ${node.type}`);
}
```

Check out [prettier-python's printer](https://github.com/prettier/prettier-python/blob/034ba8a9551f3fa22cead41b323be0b28d06d13b/src/printer.js#L174) for some examples of what is possible.

#### (optional) `embed`

A printer can have the `embed` method to print one language inside another. Examples of this are printing CSS-in-JS or fenced code blocks in Markdown. The signature is:

```ts
function embed(
  // Path to the current AST node
  path: AstPath,
  // Current options
  options: Options,
):
  | ((
      // Parses and prints the passed text using a different parser.
      // You should set `options.parser` to specify which parser to use.
      textToDoc: (text: string, options: Options) => Promise<Doc>,
      // Prints the current node or its descendant node with the current printer
      print: (
        selector?: string | number | Array<string | number> | AstPath,
      ) => Doc,
      // The following two arguments are passed for convenience.
      // They're the same `path` and `options` that are passed to `embed`.
      path: AstPath,
      options: Options,
    ) => Promise<Doc | undefined> | Doc | undefined)
  | Doc
  | undefined;
```

The `embed` method is similar to the `print` method in that it maps AST nodes to docs, but unlike `print`, it has power to do async work by returning an async function. That function's first parameter, the `textToDoc` async function, can be used to render a doc using a different plugin.

If a function returned from `embed` returns a doc or a promise that resolves to a doc, that doc will be used in printing, and the `print` method won’t be called for this node. It's also possible and, in rare situations, might be convenient to return a doc synchronously directly from `embed`, however `textToDoc` and the `print` callback aren’t available at that case. Return a function to get them.

If `embed` returns `undefined`, or if a function it returned returns `undefined` or a promise that resolves to `undefined`, the node will be printed normally with the `print` method. Same will happen if a returned function throws an error or returns a promise that rejects (e.g., if a parsing error has happened). Set the `PRETTIER_DEBUG` environment variable to a non-empty value if you want Prettier to rethrow these errors.

For example, a plugin that has nodes with embedded JavaScript might have the following `embed` method:

```js
function embed(path, options) {
  const node = path.node;
  if (node.type === "javascript") {
    return async (textToDoc) => {
      return [
        "<script>",
        hardline,
        await textToDoc(node.javaScriptCode, { parser: "babel" }),
        hardline,
        "</script>",
      ];
    };
  }
}
```

If the [`--embedded-language-formatting`](options.md#embedded-language-formatting) option is set to `off`, the embedding step is entirely skipped, `embed` isn’t called, and all nodes are printed with the `print` method.

#### (optional) `preprocess`

The `preprocess` method can process the AST from the parser before passing it into the `print` method.

```ts
function preprocess(ast: AST, options: Options): AST | Promise<AST>;
```

#### (optional) `getVisitorKeys`

This property might come in handy if the plugin uses comment attachment or embedded languages. These features traverse the AST iterating through all the own enumerable properties of each node starting from the root. If the AST has [cycles](<https://en.wikipedia.org/wiki/Cycle_(graph_theory)>), such a traverse ends up in an infinite loop. Also, nodes might contain non-node objects (e.g., location data), iterating through which is a waste of resources. To solve these issues, the printer can define a function to return property names that should be traversed.

Its signature is:

```ts
function getVisitorKeys(node, nonTraversableKeys: Set<string>): string[];
```

The default `getVisitorKeys`:

```js
function getVisitorKeys(node, nonTraversableKeys) {
  return Object.keys(node).filter((key) => !nonTraversableKeys.has(key));
}
```

The second argument `nonTraversableKeys` is a set of common keys and keys that prettier used internal.

If you have full list of visitor keys

```js
const visitorKeys = {
  Program: ["body"],
  Identifier: [],
  // ...
};

function getVisitorKeys(node /* , nonTraversableKeys*/) {
  // Return `[]` for unknown node to prevent Prettier fallback to use `Object.keys()`
  return visitorKeys[node.type] ?? [];
}
```

If you only need exclude a small set of keys

```js
const ignoredKeys = new Set(["prev", "next", "range"]);

function getVisitorKeys(node, nonTraversableKeys) {
  return Object.keys(node).filter(
    (key) => !nonTraversableKeys.has(key) && !ignoredKeys.has(key),
  );
}
```

#### (optional) `insertPragma`

A plugin can implement how a pragma comment is inserted in the resulting code when the `--insert-pragma` option is used, in the `insertPragma` function. Its signature is:

```ts
function insertPragma(text: string): string;
```

#### Handling comments in a printer

Comments are often not part of a language's AST and present a challenge for pretty printers. A Prettier plugin can either print comments itself in its `print` function or rely on Prettier's comment algorithm.

By default, if the AST has a top-level `comments` property, Prettier assumes that `comments` stores an array of comment nodes. Prettier will then use the provided `parsers[<plugin>].locStart`/`locEnd` functions to search for the AST node that each comment "belongs" to. Comments are then attached to these nodes **mutating the AST in the process**, and the `comments` property is deleted from the AST root. The `*Comment` functions are used to adjust Prettier's algorithm. Once the comments are attached to the AST, Prettier will automatically call the `printComment(path, options): Doc` function and insert the returned doc into the (hopefully) correct place.

#### (optional) `getCommentChildNodes`

By default, Prettier searches all object properties (except for a few predefined ones) of each node recursively. This function can be provided to override that behavior. It has the signature:

```ts
function getCommentChildNodes(
  // The node whose children should be returned.
  node: AST,
  // Current options
  options: object,
): AST[] | undefined;
```

Return `[]` if the node has no children or `undefined` to fall back on the default behavior.

#### (optional) `printComment`

Called whenever a comment node needs to be printed. It has the signature:

```ts
function printComment(
  // Path to the current comment node
  commentPath: AstPath,
  // Current options
  options: object,
): Doc;
```

#### (optional) `canAttachComment`

```ts
function canAttachComment(node: AST): boolean;
```

This function is used for deciding whether a comment can be attached to a particular AST node. By default, _all_ AST properties are traversed searching for nodes that comments can be attached to. This function is used to prevent comments from being attached to a particular node. A typical implementation looks like

```js
function canAttachComment(node) {
  return node.type && node.type !== "comment";
}
```

#### (optional) `isBlockComment`

```ts
function isBlockComment(node: AST): boolean;
```

Returns whether or not the AST node is a block comment.

#### (optional) `handleComments`

The `handleComments` object contains three optional functions, each with signature

```ts
(
  // The AST node corresponding to the comment
  comment: AST,
  // The full source code text
  text: string,
  // The global options object
  options: object,
  // The AST
  ast: AST,
  // Whether this comment is the last comment
  isLastComment: boolean,
) => boolean;
```

These functions are used to override Prettier's default comment attachment algorithm. `ownLine`/`endOfLine`/`remaining` is expected to either manually attach a comment to a node and return `true`, or return `false` and let Prettier attach the comment.

Based on the text surrounding a comment node, Prettier dispatches:

- `ownLine` if a comment has only whitespace preceding it and a newline afterwards,
- `endOfLine` if a comment has a newline afterwards but some non-whitespace preceding it,
- `remaining` in all other cases.

At the time of dispatching, Prettier will have annotated each AST comment node (i.e., created new properties) with at least one of `enclosingNode`, `precedingNode`, or `followingNode`. These can be used to aid a plugin's decision process (of course the entire AST and original text is also passed in for making more complicated decisions).

#### Manually attaching a comment

The `util.addTrailingComment`/`addLeadingComment`/`addDanglingComment` functions can be used to manually attach a comment to an AST node. An example `ownLine` function that ensures a comment does not follow a "punctuation" node (made up for demonstration purposes) might look like:

```js
import { util } from "prettier";

function ownLine(comment, text, options, ast, isLastComment) {
  const { precedingNode } = comment;
  if (precedingNode && precedingNode.type === "punctuation") {
    util.addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}
```

Nodes with comments are expected to have a `comments` property containing an array of comments. Each comment is expected to have the following properties: `leading`, `trailing`, `printed`.

<!-- TODO: add a note that this might change in the future -->

The example above uses `util.addTrailingComment`, which automatically sets `comment.leading`/`trailing`/`printed` to appropriate values and adds the comment to the AST node's `comments` array.

The `--debug-print-comments` CLI flag can help with debugging comment attachment issues. It prints a detailed list of comments, which includes information on how every comment was classified (`ownLine`/`endOfLine`/`remaining`, `leading`/`trailing`/`dangling`) and to which node it was attached. For Prettier’s built-in languages, this information is also available on the Playground (the 'show comments' checkbox in the Debug section).

### `options`

`options` is an object containing the custom options your plugin supports.

Example:

```js
export default {
  // ... plugin implementation
  options: {
    openingBraceNewLine: {
      type: "boolean",
      category: "Global",
      default: true,
      description: "Move open brace for code blocks onto new line.",
    },
  },
};
```

### `defaultOptions`

If your plugin requires different default values for some of Prettier’s core options, you can specify them in `defaultOptions`:

```js
export default {
  // ... plugin implementation
  defaultOptions: {
    tabWidth: 4,
  },
};
```

### Utility functions

A `util` module from Prettier core is considered a private API and is not meant to be consumed by plugins. Instead, the `util-shared` module provides the following limited set of utility functions for plugins:

```ts
type Quote = '"' | "'";
type SkipOptions = { backwards?: boolean };

function getMaxContinuousCount(text: string, searchString: string): number;

function getStringWidth(text: string): number;

function getAlignmentSize(
  text: string,
  tabWidth: number,
  startIndex?: number,
): number;

function getIndentSize(value: string, tabWidth: number): number;

function skip(
  characters: string | RegExp,
): (
  text: string,
  startIndex: number | false,
  options?: SkipOptions,
) => number | false;

function skipWhitespace(
  text: string,
  startIndex: number | false,
  options?: SkipOptions,
): number | false;

function skipSpaces(
  text: string,
  startIndex: number | false,
  options?: SkipOptions,
): number | false;

function skipToLineEnd(
  text: string,
  startIndex: number | false,
  options?: SkipOptions,
): number | false;

function skipEverythingButNewLine(
  text: string,
  startIndex: number | false,
  options?: SkipOptions,
): number | false;

function skipInlineComment(
  text: string,
  startIndex: number | false,
): number | false;

function skipTrailingComment(
  text: string,
  startIndex: number | false,
): number | false;

function skipNewline(
  text: string,
  startIndex: number | false,
  options?: SkipOptions,
): number | false;

function hasNewline(
  text: string,
  startIndex: number,
  options?: SkipOptions,
): boolean;

function hasNewlineInRange(
  text: string,
  startIndex: number,
  startIndex: number,
): boolean;

function hasSpaces(
  text: string,
  startIndex: number,
  options?: SkipOptions,
): boolean;

function makeString(
  rawText: string,
  enclosingQuote: Quote,
  unescapeUnnecessaryEscapes?: boolean,
): string;

function getNextNonSpaceNonCommentCharacter(
  text: string,
  startIndex: number,
): string;

function getNextNonSpaceNonCommentCharacterIndex(
  text: string,
  startIndex: number,
): number | false;

function isNextLineEmpty(text: string, startIndex: number): boolean;

function isPreviousLineEmpty(text: string, startIndex: number): boolean;
```

### Tutorials

- [How to write a plugin for Prettier](https://medium.com/@fvictorio/how-to-write-a-plugin-for-prettier-a0d98c845e70): Teaches you how to write a very basic Prettier plugin for TOML.

## Testing Plugins

Since plugins can be resolved using relative paths, when working on one you can do:

```js
import * as prettier from "prettier";
const code = "(add 1 2)";
await prettier.format(code, {
  parser: "lisp",
  plugins: ["."],
});
```

This will resolve a plugin relative to the current working directory.
