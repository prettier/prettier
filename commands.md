The core of the algorithm is implemented in `src/document/doc-{printer,builders,utils}.js`. The printer uses the basic formatting abstractions provided to construct a format when printing a node.

## Prettier's intermediate representation: `Doc`

A doc can be a string, an array of docs, or a command.

```ts
type Doc = string | Doc[] | DocCommand;
```

- _strings_ are printed directly as is (however for the algorithm to work properly they shouldn't contain line break characters)
- _arrays_ are used to concatenate a list of docs to be printed sequentially into a single doc
- `DocCommand` is any of the following:

### `group`

```ts
type GroupOptions = {
  shouldBreak?: boolean;
  id?: symbol;
};
declare function group(doc: Doc, options?: GroupOptions): Doc;
```

Mark a group of items which the printer should try to fit on one line. This is the basic command to tell the printer when to break. Groups are usually nested, and the printer will try to fit everything on one line, but if it doesn't fit it will break the outermost group first and try again. It will continue breaking groups until everything fits (or there are no more groups to break).

A group is forced to break if it's created with the `shouldBreak` option set to `true` or if it includes [`breakParent`](#breakParent). A [hard](#hardline) and [literal](#literalline) line breaks automatically include this so they always break parent groups. Breaks are propagated to all parent groups, so if a deeply nested expression has a hard break, everything will break. This only matters for "hard" breaks, i.e. newlines that are printed no matter what and can be statically analyzed.

For example, an array will try to fit on one line:

```js
[1, "foo", { bar: 2 }];
```

However, if any of the items inside the array have a hard break, the array will _always_ break as well:

```js
[
  1,
  function () {
    return 2;
  },
  3,
];
```

Functions always break after the opening curly brace no matter what, so the array breaks as well for consistent formatting. See [the implementation of `ArrayExpression`](#example) for an example.

The `id` option can be used in [`ifBreak`](#ifBreak) checks.

### `conditionalGroup`

This should be used as **last resort** as it triggers an exponential complexity when nested.

```ts
declare function conditionalGroup(
  alternatives: Doc[],
  options?: GroupOptions
): Doc;
```

This will try to print the first alternative, if it fit use it, otherwise go to the next one and so on. The alternatives is an array of documents going from the least expanded (most flattened) representation first to the most expanded.

```js
conditionalGroup([a, b, c]);
```

### `fill`

```ts
declare function fill(docs: Doc[]): Doc;
```

This is an alternative type of group which behaves like text layout: it's going to add a break whenever the next element doesn't fit in the line anymore. The difference with [`group`](#group) is that it's not going to break all the separators, just the ones that are at the end of lines.

```js
fill(["I", line, "love", line, "Prettier"]);
```

Expects the `docs` argument to be an array of alternating content and line breaks. In other words, elements with odd indices must be line breaks (e.g., [`softline`](#softline)).

### `ifBreak`

```ts
declare function ifBreak(
  ifBreak: Doc,
  noBreak?: Doc,
  options?: { groupId?: symbol }
): Doc;
```

Print something if the current `group` or the current element of `fill` breaks and something else if it doesn't.

```js
ifBreak(";", " ");
```

`groupId` can be used to check another _already printed_ group instead of the current group.

### `breakParent`

```ts
declare const breakParent: Doc;
```

Include this anywhere to force all parent groups to break. See [`group`](#group) for more info. Example:

```js
group([" ", expr, " ", breakParent]);
```

### `join`

```ts
declare function join(sep: Doc, docs: Doc[]): Doc;
```

Join an array of docs with a separator.

### `line`

```ts
declare const line: Doc;
```

Specify a line break. If an expression fits on one line, the line break will be replaced with a space. Line breaks always indent the next line with the current level of indentation.

### `softline`

```ts
declare const softline: Doc;
```

Specify a line break. The difference from `line` is that if the expression fits on one line, it will be replaced with nothing.

### `hardline`

```ts
declare const hardline: Doc;
```

Specify a line break that is **always** included in the output, no matter if the expression fits on one line or not.

### `literalline`

```ts
declare const literalline: Doc;
```

Specify a line break that is **always** included in the output and doesn't indent the next line. Also, unlike `hardline`, this kind of line break preserves trailing whitespace on the line it ends. This is used for template literals.

### `lineSuffix`

```ts
declare function lineSuffix(suffix: Doc): Doc;
```

This is used to implement trailing comments. It's not practical to constantly check where the line ends to avoid accidentally printing some code at the end of a comment. `lineSuffix` buffers docs passed to it and flushes them before any new line.

```js
["a", lineSuffix(" // comment"), ";", hardline];
```

will output

```js
a; // comment
```

### `lineSuffixBoundary`

```ts
declare const lineSuffixBoundary: Doc;
```

In cases where you embed code inside of templates, comments shouldn't be able to leave the code part. `lineSuffixBoundary` is an explicit marker you can use to flush the [`lineSuffix`](#lineSuffix) buffer in addition to line breaks.

```js
["{", lineSuffix(" // comment"), lineSuffixBoundary, "}", hardline];
```

will output

<!-- prettier-ignore -->
```js
{ // comment
}
```

and **not**

<!-- prettier-ignore -->
```js
{} // comment
```

### `indent`

```ts
declare function indent(doc: Doc): Doc;
```

Increase the level of indentation.

### `dedent`

```ts
declare function dedent(doc: Doc): Doc;
```

Decrease the level of indentation. (Each `align` is considered one level of indentation.)

### `align`

```ts
declare function align(widthOrString: number | string, doc: Doc): Doc;
```

Increase the indentation by a fixed number of spaces or a string. A variant of [`indent`](#indent).

When `useTabs` is enabled, trailing alignments in indentation are still spaces, but middle ones are transformed one tab per `align`. In a whitespace-sensitive context (e.g., Markdown), you should pass spaces to `align` as strings to prevent their replacement with tabs.

For example:

- `useTabs`
  - `tabWidth: 2`
    - `<indent><align 2><indent><align 2>` -> `<tab><tab><tab><2 space>`
    - `<indent><align 4><indent><align 2>` -> `<tab><tab><tab><2 space>`
  - `tabWidth: 4`
    - `<indent><align 2><indent><align 2>` -> `<tab><tab><tab><2 space>`
    - `<indent><align 4><indent><align 2>` -> `<tab><tab><tab><2 space>`

### `markAsRoot`

```ts
declare function markAsRoot(doc: Doc): Doc;
```

Mark the current indentation as root for [`dedentToRoot`](#dedentToRoot) and [`literalline`](#literalline)s.

### `dedentToRoot`

```ts
declare function dedentToRoot(doc: Doc): Doc;
```

Decrease the current indentation to the root marked by [`markAsRoot`](#markAsRoot).

### `trim`

```ts
declare const trim: Doc;
```

Trim all the indentation on the current line. This can be used for preprocessor directives. Should be placed after a line break.

### `indentIfBreak`

_Added in v2.3.0_

```ts
declare function indentIfBreak(
  doc: Doc,
  opts: { groupId: symbol; negate?: boolean }
): Doc;
```

An optimized version of `ifBreak(indent(doc), doc, { groupId })`.

With `negate: true`, corresponds to `ifBreak(doc, indent(doc), { groupId })`

It doesn't make sense to apply `indentIfBreak` to the current group because "indent if the current group is broken" is the normal behavior of `indent`. That's why `groupId` is required.

### `label`

_Added in v2.3.0_

```ts
declare function label(label: string, doc: Doc): Doc;
```

Mark a doc with a string label. This doesn't affect how the doc is printed, but can be useful for heuristics based on doc introspection.

E.g., to decide how to print an assignment expression, we might want to know whether its right-hand side has been printed as a method call chain, not as a plain function call. If the method chain printing code uses `label` to mark its result, checking that condition can be as easy as `rightHandSideDoc.label === 'method-chain'`.

### `hardlineWithoutBreakParent` and `literallineWithoutBreakParent`

_Added in v2.3.0_

```ts
declare const hardlineWithoutBreakParent: Doc;
declare const literallineWithoutBreakParent: Doc;
```

These are used very rarely, for advanced formatting tricks. Unlike their "normal" counterparts, they don't include an implicit [`breakParent`](#breakParent).

Examples:

- `hardlineWithoutBreakParent` is used for printing tables in Prettier's Markdown printer. With `proseWrap` set to `never`, the columns are aligned only if none of the rows exceeds `printWidth`.
- `literallineWithoutBreakParent` is used in the [Ruby plugin](https://github.com/prettier/plugin-ruby) for [printing heredoc syntax](https://github.com/prettier/plugin-ruby/blob/b6e7bd6bc3f70de8f146aa58ad0c8310518bf467/src/ruby/nodes/heredocs.js).

### `cursor`

```ts
declare const cursor: Doc;
```

This is a placeholder value where the cursor is in the original input in order to find where it would be printed.

### [Deprecated] `concat`

_This command has been deprecated in v2.3.0, use `Doc[]` instead_

```ts
declare function concat(docs: Doc[]): Doc;
```

Combine an array into a single doc.

## Example

For an example, here's the implementation of the `ArrayExpression` node type:

<!-- prettier-ignore -->
```js
group(
  [
    "[",
    indent(
      [
        line,
        join(
          [",", line],
          path.map(print, "elements")
        )
      ]
    ),
    line,
    "]"
  ]
);
```

This is a group with opening and closing brackets, and possibly indented contents. Because it's a `group` it will always be broken up if any of the sub-expressions are broken.
