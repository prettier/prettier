import { parse as babelParse, parseExpression } from "@babel/parser";
import tryCombinations from "../../utils/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createBabelParseError from "./utils/create-babel-parse-error.js";
import createParser from "./utils/create-parser.js";
import getSourceType from "./utils/get-source-type.js";
import wrapBabelExpression from "./utils/wrap-babel-expression.js";

const createBabelParser = (options) => createParser(createParse(options));

/** @import {ParserOptions, ParserPlugin} from "@babel/parser" */

/**
 * @typedef {typeof babelParse | typeof parseExpression} Parse
 */

/** @type {ParserOptions} */
const parseOptions = {
  sourceType: "module",
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowNewTargetOutsideFunction: true,
  allowSuperOutsideMethod: true,
  allowUndeclaredExports: true,
  errorRecovery: true,
  createParenthesizedExpressions: true,
  createImportExpressions: true,
  plugins: [
    // When adding a plugin, please add a test in `tests/format/js/babel-plugins`,
    // To remove plugins, remove it here and run `yarn test tests/format/js/babel-plugins` to verify
    "doExpressions",
    "exportDefaultFrom",
    "functionBind",
    "functionSent",
    "throwExpressions",
    "partialApplication",
    "decorators",
    "moduleBlocks",
    "asyncDoExpressions",
    "destructuringPrivate",
    "decoratorAutoAccessors",
    "explicitResourceManagement",
    "sourcePhaseImports",
    "deferredImportEvaluation",
    ["optionalChainingAssign", { version: "2023-07" }],
  ],
  tokens: true,
  ranges: true,
};

/** @type {ParserPlugin} */
const v8intrinsicPlugin = "v8intrinsic";

/** @type {Array<ParserPlugin>} */
const pipelineOperatorPlugins = [
  ["pipelineOperator", { proposal: "hack", topicToken: "%" }],
  ["pipelineOperator", { proposal: "fsharp" }],
];

const appendPlugins = (plugins, options = parseOptions) => ({
  ...options,
  plugins: [...options.plugins, ...plugins],
});

function parseWithOptions(parse, text, options) {
  const ast = parse(text, options);
  const error = ast.errors.find(
    (error) => !allowedReasonCodes.has(error.reasonCode),
  );
  if (error) {
    throw error;
  }
  return ast;
}

function createParse({ isExpression = false, optionsCombinations }) {
  return (text, options = {}) => {
    let combinations = optionsCombinations;
    const sourceType = options.__babelSourceType ?? getSourceType(options);
    if (sourceType === "script") {
      combinations = combinations.map((options) => ({
        ...options,
        sourceType: "script",
      }));
    }

    const shouldEnableV8intrinsicPlugin = /%[A-Z]/u.test(text);
    if (text.includes("|>")) {
      const conflictsPlugins = shouldEnableV8intrinsicPlugin
        ? [...pipelineOperatorPlugins, v8intrinsicPlugin]
        : pipelineOperatorPlugins;
      combinations = conflictsPlugins.flatMap((pipelineOperatorPlugin) =>
        combinations.map((options) =>
          appendPlugins([pipelineOperatorPlugin], options),
        ),
      );
    } else if (shouldEnableV8intrinsicPlugin) {
      combinations = combinations.map((options) =>
        appendPlugins([v8intrinsicPlugin], options),
      );
    }

    /** @type {Parse} */
    const parseFunction = isExpression ? parseExpression : babelParse;

    let ast;
    try {
      ast = tryCombinations(
        combinations.map(
          (options) => () => parseWithOptions(parseFunction, text, options),
        ),
      );
    } catch (/** @type {any} */ { errors: [error] }) {
      throw createBabelParseError(error);
    }

    if (isExpression) {
      ast = wrapBabelExpression(ast, { text, rootMarker: options.rootMarker });
    }

    return postprocess(ast, { parser: "babel", text });
  };
}

// Error codes are defined in
//  - https://github.com/babel/babel/tree/v7.23.6/packages/babel-parser/src/parse-error
//  - https://github.com/babel/babel/blob/v7.23.6/packages/babel-parser/src/plugins/typescript/index.ts#L73-L223
//  - https://github.com/babel/babel/blob/v7.23.6/packages/babel-parser/src/plugins/flow/index.ts#L47-L224
//  - https://github.com/babel/babel/blob/v7.23.6/packages/babel-parser/src/plugins/jsx/index.ts#L23-L44
const allowedReasonCodes = new Set([
  "StrictNumericEscape",
  "StrictWith",
  "StrictOctalLiteral",
  "StrictDelete",
  "StrictEvalArguments",
  "StrictEvalArgumentsBinding",
  "StrictFunction",
  "ForInOfLoopInitializer",

  "EmptyTypeArguments",
  "EmptyTypeParameters",
  "ConstructorHasTypeParameters",

  "UnsupportedParameterPropertyKind",

  "DecoratorExportClass",
  "ParamDupe",
  "InvalidDecimal",
  "RestTrailingComma",
  "UnsupportedParameterDecorator",
  "UnterminatedJsxContent",
  "UnexpectedReservedWord",
  "ModuleAttributesWithDuplicateKeys",
  "LineTerminatorBeforeArrow",
  "InvalidEscapeSequenceTemplate",
  "NonAbstractClassHasAbstractMethod",
  "OptionalTypeBeforeRequired",
  "PatternIsOptional",
  "OptionalBindingPattern",
  "DeclareClassFieldHasInitializer",
  "TypeImportCannotSpecifyDefaultAndNamed",
  "ConstructorClassField",

  "VarRedeclaration",
  "InvalidPrivateFieldResolution",
  "DuplicateExport",

  /*
  Legacy syntax

  ```js
  import json from "./json.json" assert {type: "json"};
  ```
  */
  "ImportAttributesUseAssert",
]);

const babelParserOptionsCombinations = [appendPlugins(["jsx"])];
const babel = createBabelParser({
  optionsCombinations: babelParserOptionsCombinations,
});
const babelTs = createBabelParser({
  optionsCombinations: [
    appendPlugins(["jsx", "typescript"]),
    appendPlugins(["typescript"]),
  ],
});
const babelExpression = createBabelParser({
  isExpression: true,
  optionsCombinations: [appendPlugins(["jsx"])],
});
const babelTSExpression = createBabelParser({
  isExpression: true,
  optionsCombinations: [appendPlugins(["typescript"])],
});
const babelEstree = createBabelParser({
  optionsCombinations: babelParserOptionsCombinations.map((options) =>
    appendPlugins(["estree"], options),
  ),
});

export default {
  babel,
  "babel-ts": babelTs,
  /** @internal */
  __js_expression: babelExpression,
  __ts_expression: babelTSExpression,
  /** for vue filter */
  __vue_expression: babelExpression,
  /** for vue filter written in TS */
  __vue_ts_expression: babelTSExpression,
  /** for vue event binding to handle semicolon */
  __vue_event_binding: babel,
  /** for vue event binding written in TS to handle semicolon */
  __vue_ts_event_binding: babelTs,
  /** verify that we can print this AST */
  __babel_estree: babelEstree,
};
