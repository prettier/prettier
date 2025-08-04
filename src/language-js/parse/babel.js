import { parse as babelParse, parseExpression } from "@babel/parser";
import getNextNonSpaceNonCommentCharacterIndex from "../../utils/get-next-non-space-non-comment-character-index.js";
import tryCombinations from "../../utils/try-combinations.js";
import getShebang from "../utils/get-shebang.js";
import postprocess from "./postprocess/index.js";
import createBabelParseError from "./utils/create-babel-parse-error.js";
import createParser from "./utils/create-parser.js";
import {
  getSourceType,
  SOURCE_TYPE_MODULE,
  SOURCE_TYPE_SCRIPT,
} from "./utils/source-types.js";
import wrapBabelExpression from "./utils/wrap-babel-expression.js";

const createBabelParser = (options) => createParser(createParse(options));

/** @import {ParserOptions, ParserPlugin} from "@babel/parser" */

/**
 * @typedef {typeof babelParse | typeof parseExpression} Parse
 */

/** @type {ParserOptions} */
const parseOptions = {
  sourceType: SOURCE_TYPE_MODULE,
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowNewTargetOutsideFunction: true,
  allowSuperOutsideMethod: true,
  allowUndeclaredExports: true,
  errorRecovery: true,
  createParenthesizedExpressions: true,
  createImportExpressions: true,
  attachComment: false,
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
    "sourcePhaseImports",
    "deferredImportEvaluation",
    ["optionalChainingAssign", { version: "2023-07" }],
    ["discardBinding", { syntaxType: "void" }],
  ],
  tokens: false,
  // Ranges not available on comments, so we use `Node#{start,end}` instead
  // https://github.com/babel/babel/issues/15115
  ranges: false,
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

// Similar to babel
// https://github.com/babel/babel/pull/7934/files#diff-a739835084910b0ee3ea649df5a4d223R67
const FLOW_PRAGMA_REGEX = /@(?:no)?flow\b/u;
function isFlowFile(text, filepath) {
  if (filepath?.endsWith(".js.flow")) {
    return true;
  }

  const shebang = getShebang(text);
  if (shebang) {
    text = text.slice(shebang.length);
  }

  const firstNonSpaceNonCommentCharacterIndex =
    getNextNonSpaceNonCommentCharacterIndex(text, 0);

  if (firstNonSpaceNonCommentCharacterIndex !== false) {
    text = text.slice(0, firstNonSpaceNonCommentCharacterIndex);
  }

  return FLOW_PRAGMA_REGEX.test(text);
}

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
    let { filepath } = options;
    if (typeof filepath !== "string") {
      filepath = undefined;
    }

    if (
      (options.parser === "babel" || options.parser === "__babel_estree") &&
      isFlowFile(text, filepath)
    ) {
      options.parser = "babel-flow";
      return babelFlow.parse(text, options);
    }

    let combinations = optionsCombinations;
    const sourceType = options.__babelSourceType ?? getSourceType(filepath);
    if (sourceType === SOURCE_TYPE_SCRIPT) {
      combinations = combinations.map((options) => ({
        ...options,
        sourceType,
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

    return postprocess(ast, { text });
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

  /*
  Allow const without initializer in `.d.ts` files
  https://github.com/prettier/prettier/issues/17649

  ```
  export const version: string;
  ```
  */
  "DeclarationMissingInitializer",
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
const babelFlow = createBabelParser({
  optionsCombinations: [
    appendPlugins(["jsx", ["flow", { all: true }], "flowComments"]),
  ],
});
const babelEstree = createBabelParser({
  optionsCombinations: babelParserOptionsCombinations.map((options) =>
    appendPlugins(["estree"], options),
  ),
});

export { babel, babelFlow as "babel-flow", babelTs as "babel-ts" };

/** @internal */
// eslint-disable-next-line simple-import-sort/exports
export {
  babelExpression as __js_expression,
  babelTSExpression as __ts_expression,
  /** for vue filter */
  babelExpression as __vue_expression,
  /** for vue filter written in TS */
  babelTSExpression as __vue_ts_expression,
  /** for vue event binding to handle semicolon */
  babel as __vue_event_binding,
  /** for vue event binding written in TS to handle semicolon */
  babelTs as __vue_ts_event_binding,
  /** verify that we can print this AST */
  babelEstree as __babel_estree,
};
