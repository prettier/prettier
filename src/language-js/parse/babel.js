import { parse as babelParse, parseExpression } from "@babel/parser";
import getNextNonSpaceNonCommentCharacterIndex from "../../utilities/get-next-non-space-non-comment-character-index.js";
import { tryCombinationsSync } from "../../utilities/try-combinations.js";
import getShebang from "../utilities/get-shebang.js";
import postprocess from "./postprocess/index.js";
import createBabelParseError from "./utilities/create-babel-parse-error.js";
import createParser from "./utilities/create-parser.js";
import {
  getSourceType,
  SOURCE_TYPE_COMMONJS,
  SOURCE_TYPE_MODULE,
} from "./utilities/source-types.js";
import wrapExpression from "./utilities/wrap-expression.js";

const createBabelParser = (options) => createParser(createParse(options));

/** @import {ParserOptions, ParserPlugin, ParseError} from "@babel/parser" */

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
  attachComment: false,
  plugins: [
    // When adding a plugin, please add a test in `tests/format/js/babel-plugins`,
    // To remove plugins, remove it here and run `yarn test tests/format/js/babel-plugins` to verify
    "doExpressions",
    "exportDefaultFrom",
    "functionBind",
    "functionSent",
    "throwExpressions",
    ["partialApplication", { version: "2018-07" }],
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

/** @type {ParserPlugin[]} */
const pipelineOperatorPlugins = [
  ["pipelineOperator", { proposal: "hack", topicToken: "%" }],
  ["pipelineOperator", { proposal: "fsharp" }],
];

/**
@param {ParserPlugin[]} plugins
@param {ParserOptions} options
@returns {ParserOptions}
*/
const appendPlugins = (plugins, options = parseOptions) => ({
  ...options,
  plugins: [...options.plugins, ...plugins],
});

// Similar to babel
// https://github.com/babel/babel/pull/7934/files#diff-a739835084910b0ee3ea649df5a4d223R67
const FLOW_PRAGMA_REGEX = /@(?:no)?flow\b/;
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

/**
@param {{isExpression: boolean, optionsCombinations: ParserOptions[]}} param0
*/
function createParse({ isExpression = false, optionsCombinations }) {
  /**
  @param {string} text
  */
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
    if (sourceType && sourceType !== SOURCE_TYPE_MODULE) {
      combinations = combinations.map((options) => ({
        ...options,
        sourceType,
        // `sourceType: "commonjs"` does not allow these two properties
        ...(sourceType === SOURCE_TYPE_COMMONJS
          ? {
              allowReturnOutsideFunction: undefined,
              allowNewTargetOutsideFunction: undefined,
            }
          : undefined),
      }));
    }

    const shouldEnableV8intrinsicPlugin = /%[A-Z]/.test(text);
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
      ast = tryCombinationsSync(
        combinations.map(
          (options) => () => parseWithOptions(parseFunction, text, options),
        ),
      );
    } catch (/** @type {any} */ { errors: [error] }) {
      throw createBabelParseError(error);
    }

    if (isExpression) {
      ast = wrapExpression({
        expression: ast,
        text,
        rootMarker: options.rootMarker,
      });
    }

    return postprocess(ast, { text });
  };
}

/** @type {ParseError["reasonCode"][]} */
const allowedReasonCodesArray = [
  "StrictNumericEscape",
  "StrictWith",
  "StrictOctalLiteral",
  "StrictDelete",
  "StrictEvalArguments",
  "StrictEvalArgumentsBinding",
  "StrictFunction",
  "ForInOfLoopInitializer",

  "ParamDupe",
  "RestTrailingComma",
  "UnsupportedParameterDecorator",
  "UnterminatedJsxContent",
  "UnexpectedReservedWord",
  "ModuleAttributesWithDuplicateKeys",
  "InvalidEscapeSequenceTemplate",
  "NonAbstractClassHasAbstractMethod",
  "PatternIsOptional",
  "DeclareClassFieldHasInitializer",

  "VarRedeclaration",
  "InvalidPrivateFieldResolution",
  "DuplicateExport",

  /*
  Allow const without initializer in `.d.ts` files
  https://github.com/prettier/prettier/issues/17649

  ```
  export const version: string;
  ```
  */
  "DeclarationMissingInitializer",
];
const allowedReasonCodes = new Set(allowedReasonCodesArray);

const babelParserOptionsCombinations = [appendPlugins(["jsx"])];
const babel = /* @__PURE__ */ createBabelParser({
  optionsCombinations: babelParserOptionsCombinations,
});
const babelTs = /* @__PURE__ */ createBabelParser({
  optionsCombinations: [
    appendPlugins(["jsx", "typescript"]),
    appendPlugins(["typescript"]),
  ],
});
const babelExpression = /* @__PURE__ */ createBabelParser({
  isExpression: true,
  optionsCombinations: [appendPlugins(["jsx"])],
});
const babelTSExpression = /* @__PURE__ */ createBabelParser({
  isExpression: true,
  optionsCombinations: [appendPlugins(["typescript"])],
});
const babelFlow = /* @__PURE__ */ createBabelParser({
  optionsCombinations: [
    appendPlugins(["jsx", ["flow", { all: true }], "flowComments"]),
  ],
});
const babelEstree = /* @__PURE__ */ createBabelParser({
  optionsCombinations: babelParserOptionsCombinations.map((options) =>
    appendPlugins(["estree"], options),
  ),
});

// eslint-disable-next-line simple-import-sort/exports
export {
  babel,
  babelFlow as "babel-flow",
  babelTs as "babel-ts",

  /** @internal */
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
