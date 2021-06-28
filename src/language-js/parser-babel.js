"use strict";

const tryCombinations = require("../utils/try-combinations");
const {
  getNextNonSpaceNonCommentCharacterIndexWithStartIndex,
  getShebang,
} = require("../common/util");
const postprocess = require("./parse-postprocess");
const createParser = require("./parser/create-parser");
const createBabelParseError = require("./parser/create-babel-parse-error");
const jsonParsers = require("./parser/json");

const parseOptions = {
  sourceType: "module",
  allowAwaitOutsideFunction: true,
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  allowSuperOutsideMethod: true,
  allowUndeclaredExports: true,
  errorRecovery: true,
  createParenthesizedExpressions: true,
  plugins: [
    // When adding a plugin, please add a test in `tests/js/babel-plugins`,
    // To remove plugins, remove it here and run `yarn test tests/js/babel-plugins` to verify
    "doExpressions",
    "exportDefaultFrom",
    "functionBind",
    "functionSent",
    "throwExpressions",
    "v8intrinsic",
    "partialApplication",
    ["decorators", { decoratorsBeforeExport: false }],
    "privateIn",
    "importAssertions",
    ["recordAndTuple", { syntaxType: "hash" }],
    "decimal",
    "classStaticBlock",
    "moduleBlocks",
    "asyncDoExpressions",
  ],
  tokens: true,
  ranges: true,
};
const pipelineOperatorPlugins = [
  ["pipelineOperator", { proposal: "smart" }],
  ["pipelineOperator", { proposal: "minimal" }],
  ["pipelineOperator", { proposal: "fsharp" }],
];
const appendPlugins = (plugins) => ({
  ...parseOptions,
  plugins: [...parseOptions.plugins, ...plugins],
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

function parseWithOptions(parseMethod, text, options) {
  // Inline the require to avoid loading all the JS if we don't use it
  /** @type {import("@babel/parser").parse | import("@babel/parser").parseExpression} */
  const parse = require("@babel/parser")[parseMethod];
  const ast = parse(text, options);
  // @ts-ignore
  const error = ast.errors.find(
    (error) => !allowedMessageCodes.has(error.reasonCode)
  );
  if (error) {
    throw error;
  }
  return ast;
}

function createParse(parseMethod, ...optionsCombinations) {
  return (text, parsers, opts = {}) => {
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

    if (text.includes("|>")) {
      combinations = pipelineOperatorPlugins.flatMap((pipelineOperatorPlugin) =>
        combinations.map((options) => ({
          ...options,
          plugins: [...options.plugins, pipelineOperatorPlugin],
        }))
      );
    }

    const { result: ast, error } = tryCombinations(
      ...combinations.map(
        (options) => () => parseWithOptions(parseMethod, text, options)
      )
    );

    if (!ast) {
      throw createBabelParseError(error);
    }

    return postprocess(ast, { ...opts, originalText: text });
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

// Error codes are defined in
//  - https://github.com/babel/babel/blob/v7.14.0/packages/babel-parser/src/parser/error-message.js
//  - https://github.com/babel/babel/blob/v7.14.0/packages/babel-parser/src/plugins/typescript/index.js#L69-L153
//  - https://github.com/babel/babel/blob/v7.14.0/packages/babel-parser/src/plugins/flow/index.js#L51-L140
//  - https://github.com/babel/babel/blob/v7.14.0/packages/babel-parser/src/plugins/jsx/index.js#L23-L39
const allowedMessageCodes = new Set([
  "StrictNumericEscape",
  "StrictWith",
  "StrictOctalLiteral",

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
const babelExpression = createParser(parseExpression);

// Export as a plugin so we can reuse the same bundle for UMD loading
module.exports = {
  parsers: {
    babel,
    "babel-flow": createParser(parseFlow),
    "babel-ts": createParser(parseTypeScript),
    ...jsonParsers,
    /** @internal */
    __js_expression: babelExpression,
    /** for vue filter */
    __vue_expression: babelExpression,
    /** for vue event binding to handle semicolon */
    __vue_event_binding: babel,
    /** verify that we can print this AST */
    __babel_estree: createParser(parseEstree),
  },
};
