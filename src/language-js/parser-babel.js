"use strict";

const flatten = require("lodash/flatten");
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
    "classProperties",
    "exportDefaultFrom",
    "functionBind",
    "functionSent",
    "classPrivateProperties",
    "throwExpressions",
    "classPrivateMethods",
    "v8intrinsic",
    "partialApplication",
    ["decorators", { decoratorsBeforeExport: false }],
    "privateIn",
    "importAssertions",
    ["recordAndTuple", { syntaxType: "hash" }],
    "decimal",
    "moduleStringNames",
    "classStaticBlock",
    "moduleBlocks",
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

  const firstNonSpaceNonCommentCharacterIndex = getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
    text,
    0
  );

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
  const error = ast.errors.find((error) => shouldRethrowRecoveredError(error));
  if (error) {
    throw error;
  }
  return ast;
}

function createParse(parseMethod, ...optionsCombinations) {
  return (text, parsers, opts = {}) => {
    if (opts.parser === "babel" && isFlowFile(text, opts)) {
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
      combinations = flatten(
        pipelineOperatorPlugins.map((pipelineOperatorPlugin) =>
          combinations.map((options) => ({
            ...options,
            plugins: [...options.plugins, pipelineOperatorPlugin],
          }))
        )
      );
    }

    const { result: ast, error } = tryCombinations(
      ...combinations.map((options) => () =>
        parseWithOptions(parseMethod, text, options)
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
const parseExpression = createParse("parseExpression", appendPlugins(["jsx"]));

const allowedMessages = new Set([
  "The only valid numeric escape in strict mode is '\\0'",
  "'with' in strict mode",
  "Legacy octal literals are not allowed in strict mode",

  "Type argument list cannot be empty.",
  "Type parameter list cannot be empty.",
  "Type parameters cannot appear on a constructor declaration.",

  "A parameter property may not be declared using a binding pattern.",
  "A parameter property is only allowed in a constructor implementation.",

  "Tuple members must all have names or all not have names.",
  "Tuple members must be labeled with a simple identifier.",

  "'abstract' modifier can only appear on a class, method, or property declaration.",
  "'readonly' modifier can only appear on a property declaration or index signature.",
  "Class methods cannot have the 'declare' modifier",
  "Class methods cannot have the 'readonly' modifier",
  "'public' modifier cannot appear on a type member.",
  "'private' modifier cannot appear on a type member.",
  "'protected' modifier cannot appear on a type member.",
  "'static' modifier cannot appear on a type member.",
  "'declare' modifier cannot appear on a type member.",
  "'abstract' modifier cannot appear on a type member.",
  "'readonly' modifier cannot appear on a type member.",
  "Accessibility modifier already seen.",
  "Index signatures cannot have the 'declare' modifier",

  "Using the export keyword between a decorator and a class is not allowed. Please use `export @dec class` instead.",
  "Argument name clash",
  "Invalid decimal",
  "Unexpected trailing comma after rest element",
  "Decorators cannot be used to decorate parameters",
  "Unterminated JSX contents",
  "Invalid parenthesized assignment pattern",
  'Unexpected token, expected "}"',
  "Unexpected token :",
  "Unexpected reserved word 'package'",
  'Duplicate key "type" is not allowed in module attributes',
  "No line break is allowed before '=>'",
  "Invalid escape sequence in template",
  "Abstract methods can only appear within an abstract class.",
  "Decorators cannot be used to decorate object literal properties",
  "A required element cannot follow an optional element.",
  "A binding pattern parameter cannot be optional in an implementation signature.",
  "Initializers are not allowed in ambient contexts.",
  "A type-only import can specify a default import or named bindings, but not both.",
  "An implementation cannot be declared in ambient contexts.",
  "Classes may not have a field named 'constructor'",
]);
function shouldRethrowRecoveredError(error) {
  const [, message] = error.message.match(/(.*?)\s*\(\d+:\d+\)/);

  if (
    allowedMessages.has(message) ||
    /^Identifier '.*?' has already been declared$/.test(message) ||
    /^Private name #.*? is not defined$/.test(message) ||
    /^`.*?` has already been exported\. Exported identifiers must be unique\.$/.test(
      message
    )
  ) {
    return false;
  }

  return true;
}

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
  },
};
