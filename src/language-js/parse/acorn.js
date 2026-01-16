import { Parser as AcornParser } from "acorn";
import acornJsx from "acorn-jsx";
import createError from "../../common/parser-create-error.js";
import { tryCombinationsSync } from "../../utilities/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utilities/create-parser.js";
import {
  getSourceType,
  SOURCE_TYPE_COMBINATIONS,
  SOURCE_TYPE_COMMONJS,
  SOURCE_TYPE_MODULE,
  SOURCE_TYPE_SCRIPT,
} from "./utilities/source-types.js";

/**
@import {Options} from "acorn";
*/

/** @type {Options} */
const parseOptions = {
  ecmaVersion: "latest",
  // sourceType: "module",
  // onInsertedSemicolon: null,
  // onTrailingComma: null,
  allowReserved: true,
  allowReturnOutsideFunction: true,
  // allowImportExportEverywhere: true,
  // allowAwaitOutsideFunction: null,
  allowSuperOutsideMethod: true,
  // allowHashBang: true,
  checkPrivateFields: false,
  locations: false,
  ranges: true,
  preserveParens: true,
};

function createParseError(error) {
  const { message, loc } = error;

  /* c8 ignore next 3 */
  if (!loc) {
    return error;
  }

  const { line, column } = loc;

  return createError(message.replace(/ \(\d+:\d+\)$/u, ""), {
    loc: {
      start: { line, column: column + 1 },
    },
    cause: error,
  });
}

/** @type {ReturnType<AcornParser.extend> | undefined} */
let parser;
const getParser = () => {
  parser ??= AcornParser.extend(acornJsx());
  return parser;
};

/**
@param {string} text
@param {SOURCE_TYPE_MODULE | SOURCE_TYPE_COMMONJS | undefined} sourceType
*/
function parseWithOptions(text, sourceType) {
  const parser = getParser();

  const comments = [];

  const ast = parser.parse(text, {
    ...parseOptions,
    // https://github.com/acornjs/acorn/pull/1377 not released yet
    sourceType:
      sourceType === SOURCE_TYPE_COMMONJS ? SOURCE_TYPE_SCRIPT : sourceType,
    allowImportExportEverywhere: sourceType === SOURCE_TYPE_MODULE,
    onComment: comments,
  });

  // @ts-expect-error -- expected
  ast.comments = comments;

  return ast;
}

function parse(text, options) {
  const sourceType = getSourceType(options?.filepath);
  const combinations = (
    sourceType ? [sourceType] : SOURCE_TYPE_COMBINATIONS
  ).map((sourceType) => () => parseWithOptions(text, sourceType));

  let ast;
  try {
    ast = tryCombinationsSync(combinations);
  } catch (/** @type {any} */ { errors: [error] }) {
    throw createParseError(error);
  }

  return postprocess(ast, { text });
}

export const acorn = createParser(parse);
