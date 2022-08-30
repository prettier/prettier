import { createRequire } from "node:module";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import postprocess from "./postprocess/index.js";

const require = createRequire(import.meta.url);

/** @type {import("acorn").Options} */
const parseOptions = {
  ecmaVersion: "latest",
  sourceType: "module",
  allowReserved: true,
  allowReturnOutsideFunction: true,
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  allowSuperOutsideMethod: true,
  allowHashBang: true,
  locations: true,
  ranges: true,
};

function createParseError(error) {
  const { message, loc } = error;

  /* istanbul ignore next */
  if (!loc) {
    return error;
  }

  const { line, column } = loc;

  return createError(message.replace(/ \(\d+:\d+\)$/, ""), {
    loc: {
      start: { line, column: column + 1 },
    },
    cause: error,
  });
}

let parser;
const getParser = () => {
  if (!parser) {
    const { Parser: AcornParser } = require("acorn");
    const acornJsx = require("acorn-jsx");
    parser = AcornParser.extend(acornJsx());
  }
  return parser;
};

function parseWithOptions(text, sourceType) {
  const parser = getParser();

  const comments = [];
  const tokens = [];

  /** @type {any} */
  const ast = parser.parse(text, {
    ...parseOptions,
    sourceType,
    onComment: comments,
    onToken: tokens,
  });
  ast.comments = comments;
  ast.tokens = tokens;

  return ast;
}

function parse(text, options = {}) {
  const { result: ast, error: moduleParseError } = tryCombinations(
    () => parseWithOptions(text, /* sourceType */ "module"),
    () => parseWithOptions(text, /* sourceType */ "script")
  );

  if (!ast) {
    // throw the error for `module` parsing
    throw createParseError(moduleParseError);
  }

  options.originalText = text;
  return postprocess(ast, options);
}

export default createParser(parse);
