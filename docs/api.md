---
id: api
title: API
---

If you want to run Prettier programmatically, check this page out.

```js
import * as prettier from "prettier";
```

Our public APIs are all asynchronous, if you must use synchronous version for some reason, you can try [`@prettier/sync`](https://github.com/prettier/prettier-synchronized).

## `prettier.format(source, options)`

`format` is used to format text using Prettier. `options.parser` must be set according to the language you are formatting (see the [list of available parsers](options.md#parser)). Alternatively, `options.filepath` can be specified for Prettier to infer the parser from the file extension. Other [options](options.md) may be provided to override the defaults.

```js
await prettier.format("foo ( );", { semi: false, parser: "babel" });
// -> 'foo()\n'
```

## `prettier.check(source [, options])`

`check` checks to see if the file has been formatted with Prettier given those options and returns a `Promise<boolean>`. This is similar to the `--check` or `--list-different` parameter in the CLI and is useful for running Prettier in CI scenarios.

## `prettier.formatWithCursor(source [, options])`

`formatWithCursor` both formats the code, and translates a cursor position from unformatted code to formatted code. This is useful for editor integrations, to prevent the cursor from moving when code is formatted.

The `cursorOffset` option should be provided, to specify where the cursor is.

```js
await prettier.formatWithCursor(" 1", { cursorOffset: 2, parser: "babel" });
// -> { formatted: '1;\n', cursorOffset: 1 }
```

## `prettier.resolveConfig(fileUrlOrPath [, options])`

`resolveConfig` can be used to resolve configuration for a given source file, passing its path or url as the first argument. The config search will start at the directory of the file location and continue to search up the directory. Or you can pass directly the path of the config file as `options.config` if you don’t wish to search for it. A promise is returned which will resolve to:

- An options object, providing a [config file](configuration.md) was found.
- `null`, if no file was found.

The promise will be rejected if there was an error parsing the configuration file.

If `options.useCache` is `false`, all caching will be bypassed.

```js
const text = await fs.readFile(filePath, "utf8");
const options = await prettier.resolveConfig(filePath);
const formatted = await prettier.format(text, {
  ...options,
  filepath: filePath,
});
```

If `options.editorconfig` is `true` and an [`.editorconfig` file](https://editorconfig.org/) is in your project, Prettier will parse it and convert its properties to the corresponding Prettier configuration. This configuration will be overridden by `.prettierrc`, etc. Currently, the following EditorConfig properties are supported:

- `end_of_line`
- `indent_style`
- `indent_size`/`tab_width`
- `max_line_length`

## `prettier.resolveConfigFile([fileUrlOrPath])`

`resolveConfigFile` can be used to find the path of the Prettier configuration file that will be used when resolving the config (i.e. when calling `resolveConfig`). A promise is returned which will resolve to:

- The path of the configuration file.
- `null`, if no file was found.

The promise will be rejected if there was an error parsing the configuration file.

The search starts at `process.cwd()`, or at the directory of `fileUrlOrPath` if provided.

```js
const configFile = await prettier.resolveConfigFile(filePath);
// you got the path of the configuration file
```

## `prettier.clearConfigCache()`

When Prettier loads configuration files and plugins, the file system structure is cached for performance. This function will clear the cache. Generally this is only needed for editor integrations that know that the file system has changed since the last format took place.

## `prettier.getFileInfo(fileUrlOrPath [, options])`

`getFileInfo` can be used by editor extensions to decide if a particular file needs to be formatted. This method returns a promise, which resolves to an object with the following properties:

```ts
{
  ignored: boolean;
  inferredParser: string | null;
}
```

The promise will be rejected if the type of `fileUrlOrPath` is not `string` or `URL`.

Setting `options.ignorePath` (`string | URL | (string | URL)[]`) and `options.withNodeModules` (`boolean`) influence the value of `ignored` (`false` by default).

If the given `fileUrlOrPath` is ignored, the `inferredParser` is always `null`.

Providing [plugin](plugins.md) paths in `options.plugins` (`string[]`) helps extract `inferredParser` for files that are not supported by Prettier core.

When setting `options.resolveConfig` (`boolean`, default `true`) to `false`, Prettier will not search for configuration file. This can be useful if this function is only used to check if file is ignored.

## `prettier.getSupportInfo()`

Returns a promise which resolves to an object representing the options, parsers, languages and file types Prettier supports.

The support information looks like this:

```ts
{
  languages: Array<{
    name: string;
    parsers: string[];
    group?: string;
    tmScope?: string;
    aceMode?: string;
    codemirrorMode?: string;
    codemirrorMimeType?: string;
    aliases?: string[];
    extensions?: string[];
    filenames?: string[];
    linguistLanguageId?: number;
    vscodeLanguageIds?: string[];
  }>;
}
```

<a name="custom-parser-api"></a>

## Custom Parser API (removed)

_Removed in v3.0.0 (superseded by the Plugin API)_

Before [plugins](plugins.md) were a thing, Prettier had a similar but more limited feature called custom parsers. It’s been removed in v3.0.0 as its functionality was a subset of what the Plugin API did. If you used it, please check the example below on how to migrate.

❌ Custom parser API (removed):

```js
import { format } from "prettier";

format("lodash ( )", {
  parser(text, { babel }) {
    const ast = babel(text);
    ast.program.body[0].expression.callee.name = "_";
    return ast;
  },
});
// -> "_();\n"
```

✔️ Plugin API:

```js
import { format } from "prettier";
import * as prettierPluginBabel from "prettier/plugins/babel";

const myCustomPlugin = {
  parsers: {
    "my-custom-parser": {
      async parse(text) {
        const ast = await prettierPluginBabel.parsers.babel.parse(text);
        ast.program.body[0].expression.callee.name = "_";
        return ast;
      },
      astFormat: "estree",
    },
  },
};

await format("lodash ( )", {
  parser: "my-custom-parser",
  plugins: [myCustomPlugin],
});
// -> "_();\n"
```

> Note: Overall, doing codemods this way isn’t recommended. Prettier uses the location data of AST nodes for many things like preserving blank lines and attaching comments. When the AST is modified after the parsing, the location data often gets out of sync, which may lead to unpredictable results. Consider using [jscodeshift](https://github.com/facebook/jscodeshift) if you need codemods.

As part of the removed Custom parser API, it was previously possible to pass a path to a module exporting a `parse` function via the `--parser` option. Use the `--plugin` CLI option or the `plugins` API option instead to [load plugins](plugins.md#using-plugins).
