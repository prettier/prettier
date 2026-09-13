---
id: babel-parser
title: "@babel/parser"
---

<p align="left">
  The Babel parser (previously Babylon) is a JavaScript parser used in <a href="https://github.com/babel/babel">Babel</a>.
</p>

- The latest ECMAScript version enabled by default (ES2020).
- Comment attachment.
- Support for JSX, Flow, TypeScript.
- Support for experimental language proposals (accepting PRs for anything at least [stage-0](https://github.com/tc39/proposals/blob/master/stage-0-proposals.md)).

## Credits

Heavily based on [acorn](https://github.com/marijnh/acorn) and [acorn-jsx](https://github.com/RReverser/acorn-jsx),
thanks to the awesome work of [@RReverser](https://github.com/RReverser) and [@marijnh](https://github.com/marijnh).

## API

### `babelParser.parse(code, [options])`

### `babelParser.parseExpression(code, [options])`

`parse()` parses the provided `code` as an entire ECMAScript program, while
`parseExpression()` tries to parse a single Expression with performance in
mind. When in doubt, use `.parse()`.

### Options

<details>
  <summary>History</summary>

| Version   | Changes                                            |
| --------- | -------------------------------------------------- |
| `v8.0.0`  | Added `locations`                                  |
| `v7.28.0` | Added `sourceType: "commonjs"`                     |
| `v7.27.0` | Added `allowYieldOutsideFunction`                  |
| `v7.26.0` | Added `startIndex`                                 |
| `v7.23.0` | Added `createImportExpressions`                    |
| `v7.21.0` | Added `allowNewTargetOutsideFunction` and `annexB` |
| `v7.16.0` | Added `startColumn`                                |
| `v7.15.0` | Added `attachComment`                              |
| `v7.7.0`  | Added `errorRecovery`                              |
| `v7.5.0`  | Added `allowUndeclaredExports`                     |
| `v7.2.0`  | Added `createParenthesizedExpressions`             |

</details>



- **allowImportExportEverywhere**: By default, `import` and `export`
  declarations can only appear at a program's top level. Setting this
  option to `true` allows them anywhere where a statement is allowed.

- **allowAwaitOutsideFunction**: By default, `await` use is only allowed
  inside of an async function or, when the `topLevelAwait` plugin is enabled,
  in the top-level scope of modules. Set this to `true` to also accept it in the
  top-level scope of scripts. This option is discouraged in favor of
  `topLevelAwait` plugin.

- **allowYieldOutsideFunction**: By default, `yield` use is only allowed
  inside of a generator function. Set this to `true` to also accept it in the
  top-level.

- **allowNewTargetOutsideFunction**: By default, `new.target` use is not
  allowed outside of a function or class. Set this to `true` to accept such code.

- **allowReturnOutsideFunction**: By default, a return statement at
  the top level raises an error. Set this to `true` to accept such
  code.

- **allowSuperOutsideMethod**: By default, `super` use is not allowed
  outside of class and object methods. Set this to `true` to accept such
  code.

- **allowUndeclaredExports**: By default, exporting an identifier that was
  not declared in the current module scope will raise an error. While this
  behavior is required by the ECMAScript modules specification, Babel's
  parser cannot anticipate transforms later in the plugin pipeline that
  might insert the appropriate declarations, so it is sometimes important
  to set this option to `true` to prevent the parser from prematurely
  complaining about undeclared exports that will be added later.

- **attachComment**: By default, Babel attaches comments to adjacent AST nodes. When this option is set to `false`, comments are not attached. It can provide up to 30% performance improvement when the input code has _many_ comments. `@babel/eslint-parser` will set it for you. It is not recommended to use `attachComment: false` with Babel transform, as doing so removes all the comments in output code, and renders annotations such as `/* istanbul ignore next */` nonfunctional.

- **annexB**: By default, Babel parses JavaScript according to [ECMAScript's Annex B "_Additional ECMAScript Features for Web Browsers_"](https://tc39.es/ecma262/#sec-additional-ecmascript-features-for-web-browsers) syntax. When this option is set to `false`, Babel will parse syntax without the extensions specific to Annex B.

- **createImportExpressions**: By default, the parser parses dynamic import `import()` as call expression nodes. When this option is set to `true`, `ImportExpression` AST nodes are created instead. This option will default to `true` in Babel 8.

- **createParenthesizedExpressions**: By default, the parser sets `extra.parenthesized` on the expression nodes. When this option is set to `true`, `ParenthesizedExpression` AST nodes are created instead.

- **errorRecovery**: By default, Babel always throws an error when it finds some invalid
  code. When this option is set to `true`, it will store the parsing error and try to continue
  parsing the invalid input file.
  The resulting AST will have an `errors` property representing an array of all the parsing errors.
  Note that even when this option is enabled, `@babel/parser` could throw for unrecoverable errors.

- **locations**: boolean.
  `true` is the default and will add a `loc` property to each node, which is an object with `start` and `end` properties, which are objects containing `line` and `column` numbers.
  When set to `false`, the "loc" property will not be included in the output AST.

- **plugins**: Array containing the plugins that you want to enable.

- **sourceType**: Indicate the mode the code should be parsed in. Can be
  one of `"script"`, `"commonjs"`, `"module"` or `"unambiguous"`. Defaults to `"script"`. `"unambiguous"` will make @babel/parser attempt to _guess_, based on the presence of ES6 `import` or `export` statements. Files with ES6 `import`s and `export`s are considered `"module"` and are otherwise `"script"`.

  The `"commonjs"` mode indicates that the code should be run in a CommonJS environment such as Node.js. It is mostly compatible with the `"script"` mode except that `return`, `new.target` and `using`/`await using` declarations are allowed in the top level.

- **sourceFilename**: Correlate output AST nodes with their source filename. Useful when generating code and source maps from the ASTs of multiple input files.

- **startColumn**: By default, the parsed code is treated as if it starts from line 1, column 0. You can provide a column number to alternatively start with. Useful for integration with other source tools.

- **startLine**: By default, the parsed code is treated as if it starts from line 1, column 0. You can provide a line number to alternatively start with. Useful for integration with other source tools.

- **startIndex**: By default, all source indexes start from 0. With this option you can provide an alternative start index.
  To ensure accurate AST source indexes this option should always be provided when `startLine` is greater than 1. Useful for integration with other source tools.

- **strictMode**: By default, ECMAScript code is parsed as strict only if a
  `"use strict";` directive is present or if the parsed file is an ECMAScript
  module. Set this option to `true` to always parse files in strict mode.

- **ranges**: Adds a `range` property to each node: `[node.start, node.end]`

- **tokens**: Adds all parsed tokens to a `tokens` property on the `File` node

### Output

The Babel parser generates AST according to [Babel AST format][].
It is based on [ESTree spec][] with the following deviations:

- [Literal][] token is replaced with [StringLiteral][], [NumericLiteral][], [BigIntLiteral][], [BooleanLiteral][], [NullLiteral][], [RegExpLiteral][]
- [Property][] token is replaced with [ObjectProperty][] and [ObjectMethod][]
- [MethodDefinition][] is replaced with [ClassMethod][] and [ClassPrivateMethod][]
- [PropertyDefinition][] is replaced with [ClassProperty][] and [ClassPrivateProperty][]
- [PrivateIdentifier][] is replaced with [PrivateName][]
- [Program][] and [BlockStatement][] contain additional `directives` field with [Directive][] and [DirectiveLiteral][]
- [ClassMethod][], [ClassPrivateMethod][], [ObjectProperty][], and [ObjectMethod][] value property's properties in [FunctionExpression][] is coerced/brought into the main method node.
- [ChainExpression][] is replaced with [OptionalMemberExpression][] and [OptionalCallExpression][]
- [ImportExpression][] is replaced with a [CallExpression][] whose `callee` is an [Import] node. This change will be reversed in Babel 8.
- [ExportAllDeclaration][] with `exported` field is replaced with an [ExportNamedDeclaration][] containing an [ExportNamespaceSpecifier][] node.

:::note
The `estree` plugin can revert these deviations. Use it only if you are passing Babel AST to other ESTree-compliant tools.
:::

AST for JSX code is based on [Facebook JSX AST][].

[babel ast format]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md
[estree spec]: https://github.com/estree/estree
[literal]: https://github.com/estree/estree/blob/master/es5.md#literal
[property]: https://github.com/estree/estree/blob/master/es5.md#property
[methoddefinition]: https://github.com/estree/estree/blob/master/es2015.md#methoddefinition
[propertydefinition]: https://github.com/estree/estree/blob/master/es2022.md#propertydefinition
[chainexpression]: https://github.com/estree/estree/blob/master/es2020.md#chainexpression
[importexpression]: https://github.com/estree/estree/blob/master/es2020.md#importexpression
[exportalldeclaration]: https://github.com/estree/estree/blob/master/es2020.md#exportalldeclaration
[privateidentifier]: https://github.com/estree/estree/blob/master/es2022.md#privateidentifier
[stringliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#stringliteral
[numericliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#numericliteral
[bigintliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#bigintliteral
[booleanliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#booleanliteral
[nullliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#nullliteral
[regexpliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#regexpliteral
[objectproperty]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#objectproperty
[objectmethod]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#objectmethod
[classmethod]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#classmethod
[classproperty]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#classproperty
[classprivateproperty]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#classprivateproperty
[classprivatemethod]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#classprivatemethod
[privatename]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#privatename
[program]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#programs
[blockstatement]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#blockstatement
[directive]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#directive
[directiveliteral]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#directiveliteral
[functionexpression]: https://github.com/babel/babel/tree/main/packages/babel-parser/ast/spec.md#functionexpression
[optionalmemberexpression]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#optionalmemberexpression
[optionalcallexpression]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#optionalcallexpression
[callexpression]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#callexpression
[import]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#import
[exportnameddeclaration]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#exportnameddeclaration
[exportnamespacespecifier]: https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#exportnamespacespecifier
[facebook jsx ast]: https://github.com/facebook/jsx/blob/main/AST.md

### Semver

The Babel Parser follows semver in most situations. The only thing to note is that some spec-compliancy bug fixes may be released under patch versions.

For example: We push a fix to early error on something like [#107](https://github.com/babel/babylon/pull/107) - multiple default exports per file. That would be considered a bug fix even though it would cause a build to fail.

### Example

```js title="JavaScript"
require("@babel/parser").parse("code", {
  // parse in strict mode and allow module declarations
  sourceType: "module",

  plugins: [
    // enable jsx and flow syntax
    "jsx",
    "flow",
  ],
});
```

### Plugins

#### Miscellaneous

| Name                                                | Code Example |
| --------------------------------------------------- | ------------ |
| `estree` ([repo](https://github.com/estree/estree)) | n/a          |

#### Language extensions

<details>
  <summary>History</summary>

| Version  | Changes             |
| -------- | ------------------- |
| `v7.6.0` | Added `v8intrinsic` |

</details>

| Name                                                              | Code Example                              |
| ----------------------------------------------------------------- | ----------------------------------------- |
| `flow` ([repo](https://github.com/facebook/flow))                 | `var a: string = "";`                     |
| `flowComments` ([docs](https://flow.org/en/docs/types/comments/)) | <code>/\*:: type Foo = \{...}; \*/</code> |
| `jsx` ([repo](https://facebook.github.io/jsx/))                   | `<a attr="b">{s}</a>`                     |
| `typescript` ([repo](https://github.com/Microsoft/TypeScript))    | `var a: string = "";`                     |
| `v8intrinsic`                                                     | `%DebugPrint(foo);`                       |

#### ECMAScript [proposals](https://github.com/babel/proposals)

| Name                                                                                                                | Code Example                                                     |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `asyncDoExpressions` ([proposal](https://github.com/tc39/proposal-async-do-expressions))                            | `async do { await requestAPI().json() }`                         |
| `decorators` ([proposal](https://github.com/tc39/proposal-decorators)) <br/> `decorators-legacy`                    | `@a class A {}`                                                  |
| `decoratorAutoAccessors` ([proposal](https://github.com/tc39/proposal-decorators))                                  | `class Example { @reactive accessor myBool = false; }`           |
| `deferredImportEvaluation` ([proposal](https://github.com/tc39/proposal-defer-import-eval))                         | `import defer * as ns from "dep";`                               |
| `deprecatedImportAssert` (legacy syntax of [import attributes](https://github.com/tc39/proposal-import-attributes)) | `import json from "./foo.json" assert { type: "json" };`         |
| `destructuringPrivate` ([proposal](https://github.com/tc39/proposal-destructuring-private))                         | `class Example { #x = 1; method() { const { #x: x } = this; } }` |
| `discardBinding` ([proposal](https://github.com/tc39/proposal-discard-binding))                                     | `using void = new Lock(mutex)`                                   |
| `doExpressions` ([proposal](https://github.com/tc39/proposal-do-expressions))                                       | `var a = do { if (true) { 'hi'; } };`                            |
| `exportDefaultFrom` ([proposal](https://github.com/tc39/ecmascript-export-default-from))                            | `export v from "mod"`                                            |
| `functionBind` ([proposal](https://github.com/zenparsing/es-function-bind))                                         | `a::b`, `::console.log`                                          |
| `functionSent` ([proposal](https://github.com/tc39/proposal-function.sent))                                         | `function.sent`                                                  |
| `moduleBlocks` ([proposal](https://github.com/tc39/proposal-js-module-blocks))                                      | `let m = module { export let y = 1; };`                          |
| `optionalChainingAssign` ([proposal](https://github.com/tc39/proposal-optional-chaining-assignment))                | `x?.prop = 2`                                                    |
| `partialApplication` ([proposal](https://github.com/babel/proposals/issues/32))                                     | `f(?, a)`                                                        |
| `pipelineOperator` ([proposal](https://github.com/babel/proposals/issues/29))                                       | <code>a &#124;> b</code>                                         |
| `sourcePhaseImports` ([proposal](https://github.com/tc39/proposal-source-phase-imports))                            | `import source x from "./x"`                                     |
| `throwExpressions` ([proposal](https://github.com/babel/proposals/issues/23))                                       | `() => throw new Error("")`                                      |



#### Plugins options

<details>
  <summary>History</summary>

| Version  | Changes                                                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `7.21.0` | The default behavior of the `decorators`' `decoratorsBeforeExport` option is to allow decorators either before or after the `export` keyword. |
| `7.19.0` | The `syntaxType` option of the `recordAndTuple` plugin defaults to `hash`; added `allowCallParenthesized` option for the `decorators` plugin. |
| `7.17.0` | Added `@@` and `^^` to the `topicToken` option of the `hack` pipeline operator                                                                |
| `7.16.0` | Added `disallowAmbiguousJSXLike` for `typescript` plugin. Added `^` to the `topicToken` option of the `hack` pipeline operators               |
| `7.14.0` | Added `dts` for `typescript` plugin                                                                                                           |

</details>

<!-- TODO: Is this note still true? Don't we raise an exception? -->

:::note
When a plugin is specified multiple times, only the first options are considered.
:::

- `decorators`:
  - `allowCallParenthesized` (`boolean`, defaults to `true`)

    When `false`, disallow decorators in the `@(...)()` form in favor of `@(...())`. The stage 3 decorators proposal uses `allowCallParenthesized: false`.

  - `decoratorsBeforeExport` (`boolean`)

    By default decorators on exported classes can be placed either before or after the `export` keyword. When this option is set, decorators will only be allowed in the specified position.

    ```js title="JavaScript"
    // decoratorsBeforeExport: true
    @dec
    export class C {}

    // decoratorsBeforeExport: false
    export
    @dec
    class C {}
    ```

    :::caution

    This option is deprecated and will be removed in a future version. Code that is valid when this option is explicitly set to `true` or `false` is also valid when this option is not set.
    :::

- `optionalChainingAssign`:
  - `version` (required, accepted values: `2023-07`)
    This proposal is still at Stage 1, and thus it's likely that it will be affected by breaking changes.
    You must specify which version of the proposal you are using to ensure that Babel will continue
    to parse your code in a compatible way.

- `pipelineOperator`:



  - `proposal` (required, accepted values: `fsharp`, `hack`)
    There are several different proposals for the pipeline operator.
    This option chooses which proposal to use.
    See [plugin-proposal-pipeline-operator](plugin-proposal-pipeline-operator.md)
    for more information, including a table comparing their behavior.

  - `topicToken` (required when `proposal` is `hack`, accepted values: `%`, `#`, `^`, `@@`, `^^`)
    The `hack` proposal uses a “topic” placeholder in its pipe.
    There are two different choices for this topic placeholder.
    This option chooses what token to use to refer to the topic.

- `partialApplication`:
  - `version` (required, with the only valid value being `2018-07`).
    Specify which version of the partial application proposal you are using. `2018-07` represents the proposal as
    it was presented at the July 2018 TC39 meeting.



- `flow`:
  - `all` (`boolean`, default: `false`)
    Some code has different meaning in Flow and in vanilla JavaScript. For example, `foo<T>(x)` is parsed as a call expression with a type argument in Flow, but as a comparison (`foo < T > x`) accordingly to the ECMAScript specification. By default, `babel-parser` parses those ambiguous constructs as Flow types only if the file starts with a `// @flow` pragma.
    Set this option to `true` to always parse files as if `// @flow` was specified.

- `typescript`
  - `dts` (`boolean`, default `false`)
    This option will enable parsing within a TypeScript ambient context, where certain syntax have different rules (like `.d.ts` files and inside `declare module` blocks). Please see [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) and [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/type-system/intro) for more information about ambient contexts.
  - `disallowAmbiguousJSXLike` (`boolean`, default `false`)
    Even when the `jsx` plugin is not enabled, this option disallows using syntax that would be ambiguous with JSX (`<X> y` type assertions and `<X>() => {}` type arguments). It matches the `tsc` behavior when parsing `.mts` and `.mjs` files.



### Error codes

<details>
  <summary>History</summary>

| Version   | Changes           |
| --------- | ----------------- |
| `v7.14.0` | Added error codes |

</details>

Error codes are useful for handling the errors thrown by `@babel/parser`.

There are two error codes, `code` and `reasonCode`.

- `code`
  - Rough classification of errors (e.g. `BABEL_PARSER_SYNTAX_ERROR`, `BABEL_PARSER_SOURCETYPE_MODULE_REQUIRED`).
- `reasonCode`
  - Detailed classification of errors (e.g. `MissingSemicolon`, `VarRedeclaration`).

Example of using error codes with `errorRecovery`:

```js title="JavaScript"
const { parse } = require("@babel/parser");

const ast = parse(`a b`, { errorRecovery: true });

console.log(ast.errors[0].code); // BABEL_PARSER_SYNTAX_ERROR
console.log(ast.errors[0].reasonCode); // MissingSemicolon
```

### FAQ

#### Will the Babel parser support a plugin system?

Previous issues: [#1351](https://github.com/babel/babel/issues/1351), [#6694](https://github.com/babel/babel/issues/6694).

We currently aren't willing to commit to supporting the API for plugins or the resulting ecosystem (there is already enough work maintaining Babel's own plugin system). It's not clear how to make that API effective, and it would limit our ability to refactor and optimize the codebase.

Our current recommendation for those that want to create their own custom syntax is for users to fork the parser.

To consume your custom parser, you can add a plugin to your [options](options.md#plugins) to call the parser via its npm package name or require it if using JavaScript,

```js title="JavaScript"
const parse = require("custom-fork-of-babel-parser-on-npm-here");

module.exports = {
  plugins: [
    {
      parserOverride(code, opts) {
        return parse(code, opts);
      },
    },
  ],
};
```
