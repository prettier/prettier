import tryCombinations from "../../utils/try-combinations.js";
import getShebang from "../utils/get-shebang.js";
import getNextNonSpaceNonCommentCharacterIndexWithStartIndex from "../../utils/text/get-next-non-space-non-comment-character-index-with-start-index.js";
import createParser from "./utils/create-parser.js";
import createBabelParseError from "./utils/create-babel-parse-error.js";
import postprocess from "./postprocess/index.js";
import jsonParsers from "./json.js";

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
  allowSuperOutsideMethod: true,
  allowUndeclaredExports: true,
  errorRecovery: true,
  createParenthesizedExpressions: true,
  plugins: [
    // When adding a plugin, please add a test in `tests/format/js/babel-plugins`,
    // To remove plugins, remove it here and run `yarn test tests/format/js/babel-plugins` to verify
    "doExpressions",
    "exportDefaultFrom",
    "functionBind",
    "functionSent",
    "throwExpressions",
    "partialApplication",
    ["decorators", { decoratorsBeforeExport: false }],
    "importAssertions",
    "decimal",
    "moduleBlocks",
    "asyncDoExpressions",
    "regexpUnicodeSets",
    "destructuringPrivate",
    "decoratorAutoAccessors",
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
  if (options.filepath && options.filepath.endsWith(".js.flow")) {
    return true;
  }

  const shebang = getShebang(text);
  if (shebang) {
    text = text.slice(shebang.length);
  }

  const firstNonSpaceNonCommentCharacterIndex =
    getNextNonSpaceNonCommentCharacterIndexWithStartIndex(text, 0);

  if (firstNonSpaceNonCommentCharacterIndex !== false) {
    text = text.slice(0, firstNonSpaceNonCommentCharacterIndex);
  }

  return FLOW_PRAGMA_REGEX.test(text);
}

function parseWithOptions(parse, text, options) {
  const ast = parse(text, options);
  const error = ast.errors.find(
    (error) => !allowedMessageCodes.has(error.reasonCode)
  );
  if (error) {
    throw error;
  }
  return ast;
}

function createParse(parseMethod, ...optionsCombinations) {
  return async (text, parsers, opts = {}) => {
    if (
      (opts.parser === "babel" || opts.parser === "__babel_estree") &&
      isFlowFile(text, opts)
    ) {
      opts.parser = "babel-flow";
      return parseFlow(text, parsers, opts);
    }

    let combinations = optionsCombinations;
    if (opts.__babelSourceType === "script") {
      combinations = combinations.map((options) => ({
        ...options,
        sourceType: "script",
      }));
    }

    if (/#[[{]/.test(text)) {
      combinations = combinations.map((options) =>
        appendPlugins([recordAndTuplePlugin], options)
      );
    }

    const shouldEnableV8intrinsicPlugin = /%[A-Z]/.test(text);
    if (text.includes("|>")) {
      const conflictsPlugins = shouldEnableV8intrinsicPlugin
        ? [...pipelineOperatorPlugins, v8intrinsicPlugin]
        : pipelineOperatorPlugins;
      combinations = conflictsPlugins.flatMap((pipelineOperatorPlugin) =>
        combinations.map((options) =>
          appendPlugins([pipelineOperatorPlugin], options)
        )
      );
    } else if (shouldEnableV8intrinsicPlugin) {
      combinations = combinations.map((options) =>
        appendPlugins([v8intrinsicPlugin], options)
      );
    }

    // Inline `import()` to avoid loading all the JS if we don't use it
    const { parse: babelParse, parseExpression } = await import(
      "@babel/parser"
    );
    /** @type {Parse} */
    const parseFunction =
      parseMethod === "parseExpression" ? parseExpression : babelParse;
    const { result: ast, error } = tryCombinations(
      ...combinations.map(
        (options) => () => parseWithOptions(parseFunction, text, options)
      )
    );

    if (!ast) {
      throw createBabelParseError(error);
    }

    opts.originalText = text;
    return postprocess(ast, opts);
  };
}

const parse = createParse("parse", appendPlugins(["jsx", "flow"]));
const parseFlow = createParse(
  "parse",
  appendPlugins(["jsx", ["flow", { all: true, enums: true }]])
);
const parseTypeScript = createParse(
  "parse",
  appendPlugins(["jsx", "typescript"]),
  appendPlugins(["typescript"])
);
const parseEstree = createParse(
  "parse",
  appendPlugins(["jsx", "flow", "estree"])
);
const parseExpression = createParse("parseExpression", appendPlugins(["jsx"]));

const parseTSExpression = createParse(
  "parseExpression",
  appendPlugins(["typescript"])
);

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
  "UnexpectedParameterModifier",

  "MixedLabeledAndUnlabeledElements",
  "InvalidTupleMemberLabel",

  "NonClassMethodPropertyHasAbstractModifer",
  "ReadonlyForMethodSignature",
  "ClassMethodHasDeclare",
  "ClassMethodHasReadonly",
  "InvalidModifierOnTypeMember",
  "DuplicateAccessibilityModifier",
  "IndexSignatureHasDeclare",

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
  "UnsupportedPropertyDecorator",
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

const babel = createParser(parse);
const babelTs = createParser(parseTypeScript);
const babelExpression = createParser(parseExpression);
const babelTSExpression = createParser(parseTSExpression);

// Export as a plugin so we can reuse the same bundle for UMD loading
const parser = {
  parsers: {
    babel,
    "babel-flow": createParser(parseFlow),
    "babel-ts": babelTs,
    ...jsonParsers,
    /** @internal */
    __js_expression: babelExpression,
    /** for vue filter */
    __vue_expression: babelExpression,
    /** for vue filter written in TS */
    __vue_ts_expression: babelTSExpression,
    /** for vue event binding to handle semicolon */
    __vue_event_binding: babel,
    /** for vue event binding written in TS to handle semicolon */
    __vue_ts_event_binding: babelTs,
    /** verify that we can print this AST */
    __babel_estree: createParser(parseEstree),
  },
};

export default parser;
