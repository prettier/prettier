import { parse as babelParse, parseExpression } from "@babel/parser";
import tryCombinations from "../../utils/try-combinations.js";
import getShebang from "../utils/get-shebang.js";
import getNextNonSpaceNonCommentCharacterIndex from "../../utils/get-next-non-space-non-comment-character-index.js";
import createParser from "./utils/create-parser.js";
import createBabelParseError from "./utils/create-babel-parse-error.js";
import postprocess from "./postprocess/index.js";
import getSourceType from "./utils/get-source-type.js";
import wrapBabelExpression from "./utils/wrap-babel-expression.js";

const createBabelParser = (options) => createParser(createParse(options));

/**
 * @typedef {import("@babel/parser").parse | import("@babel/parser").parseExpression} Parse
 * @typedef {import("@babel/parser").ParserOptions} ParserOptions
 * @typedef {import("@babel/parser").ParserPlugin} ParserPlugin
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
    "decimal",
    "moduleBlocks",
    "asyncDoExpressions",
    "regexpUnicodeSets",
    "destructuringPrivate",
    "decoratorAutoAccessors",
    "importReflection",
    "explicitResourceManagement",
    ["importAttributes", { deprecatedAssertSyntax: true }],
    "sourcePhaseImports",
    "deferredImportEvaluation",
    ["optionalChainingAssign", { version: "2023-07" }],
  ],
  tokens: true,
  ranges: true,
};

/** @type {ParserPlugin} */
const recordAndTuplePlugin = ["recordAndTuple", { syntaxType: "hash" }];

/** @type {ParserPlugin} */
const v8intrinsicPlugin = "v8intrinsic";

/** @type {Array<ParserPlugin>} */
const pipelineOperatorPlugins = [
  ["pipelineOperator", { proposal: "hack", topicToken: "%" }],
  ["pipelineOperator", { proposal: "minimal" }],
  ["pipelineOperator", { proposal: "fsharp" }],
];

const appendPlugins = (plugins, options = parseOptions) => ({
  ...options,
  plugins: [...options.plugins, ...plugins],
});

// Similar to babel
// https://github.com/babel/babel/pull/7934/files#diff-a739835084910b0ee3ea649df5a4d223R67
const FLOW_PRAGMA_REGEX = /@(?:no)?flow\b/;
function isFlowFile(text, options) {
  if (options.filepath?.endsWith(".js.flow")) {
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
    (error) => !allowedMessageCodes.has(error.reasonCode),
  );
  if (error) {
    throw error;
  }
  return ast;
}

function createParse({ isExpression = false, optionsCombinations }) {
  return (text, options = {}) => {
    if (
      (options.parser === "babel" || options.parser === "__babel_estree") &&
      isFlowFile(text, options)
    ) {
      options.parser = "babel-flow";
      return babelFlow.parse(text, options);
    }

    let combinations = optionsCombinations;
    const sourceType = options.__babelSourceType ?? getSourceType(options);
    if (sourceType === "script") {
      combinations = combinations.map((options) => ({
        ...options,
        sourceType: "script",
      }));
    }

    if (/#[[{]/.test(text)) {
      combinations = combinations.map((options) =>
        appendPlugins([recordAndTuplePlugin], options),
      );
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
//  - https://github.com/babel/babel/blob/v7.14.0/packages/babel-parser/src/parser/error-message.js
//  - https://github.com/babel/babel/blob/v7.14.0/packages/babel-parser/src/plugins/typescript/index.js#L69-L153
//  - https://github.com/babel/babel/blob/v7.14.0/packages/babel-parser/src/plugins/flow/index.js#L51-L140
//  - https://github.com/babel/babel/blob/v7.14.0/packages/babel-parser/src/plugins/jsx/index.js#L23-L39
const allowedMessageCodes = new Set([
  "StrictNumericEscape",
  "StrictWith",
  "StrictOctalLiteral",
  "StrictDelete",
  "StrictEvalArguments",
  "StrictEvalArgumentsBinding",
  "StrictFunction",

  "EmptyTypeArguments",
  "EmptyTypeParameters",
  "ConstructorHasTypeParameters",

  "UnsupportedParameterPropertyKind",

  "MixedLabeledAndUnlabeledElements",

  "DuplicateAccessibilityModifier",

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
  "DeclareFunctionHasImplementation",
  "ConstructorClassField",

  "VarRedeclaration",
  "InvalidPrivateFieldResolution",
  "DuplicateExport",
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
    appendPlugins([
      "jsx",
      ["flow", { all: true, enums: true }],
      "flowComments",
    ]),
  ],
});
const babelEstree = createBabelParser({
  optionsCombinations: babelParserOptionsCombinations.map((options) =>
    appendPlugins(["estree"], options),
  ),
});

export default {
  babel,
  "babel-flow": babelFlow,
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
