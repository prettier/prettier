import { createRequire } from "node:module";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import postprocess from "./postprocess/index.js";
import getSourceType from "./utils/get-source-type.js";

const require = createRequire(import.meta.url);

/** @type {import("acorn").Options} */
const parseOptions = {
  ecmaVersion: "latest",
  // sourceType: "module",
  allowReturnOutsideFunction: true,
  // allowImportExportEverywhere: true,
  allowSuperOutsideMethod: true,
  locations: true,
  ranges: true,
};

function createParseError(error) {
  const { message, loc } = error;

  /* c8 ignore next 3 */
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
    allowImportExportEverywhere: sourceType === "module",
    onComment: comments,
    onToken: tokens,
  });
  ast.comments = comments;
  ast.tokens = tokens;

  return ast;
}

function parse(text, options = {}) {
  const sourceType = getSourceType(options);
  const combinations = (sourceType ? [sourceType] : ["module", "script"]).map(
    (sourceType) => () => parseWithOptions(text, sourceType),
  );

  let ast;
  try {
    ast = tryCombinations(combinations);
  } catch (/** @type {any} */ { errors: [error] }) {
    throw createParseError(error);
  }

  return postprocess(ast, { text });
}

export const acorn = createParser(parse);
