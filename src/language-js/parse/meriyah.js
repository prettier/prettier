import { parse as meriyahParse } from "meriyah";
import createError from "../../common/parser-create-error.js";
import { tryCombinationsSync } from "../../utilities/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utilities/create-parser.js";
import {
  getSourceType,
  SOURCE_TYPE_COMBINATIONS,
} from "./utilities/source-types.js";

/**
@import {ESTree as MeriyahESTree} from "meriyah";
@import {SOURCE_TYPE_MODULE, SOURCE_TYPE_COMMONJS} from "./utilities/source-types.js";
*/

// https://github.com/meriyah/meriyah/blob/4676f60b6c149d7082bde2c9147f9ae2359c8075/src/parser.ts#L185
const parseOptions = {
  // Allow module code
  // module: true,
  // Enable stage 3 support (ESNext)
  next: true,
  // Enable start and end offsets to each node
  ranges: true,
  // Enable web compatibility
  webcompat: true,
  // Enable line/column location information to each node
  loc: false,
  // Attach raw property to each literal and identifier node
  raw: true,
  // Enabled directives
  directives: true,
  // Enable implied strict mode
  impliedStrict: false,
  // Enable non-standard parenthesized expression node
  preserveParens: true,
  // Enable lexical binding and scope tracking
  lexical: false,
  // Adds a source attribute in every node’s loc object when the locations option is `true`
  // source: false,
  // Enable React JSX parsing
  jsx: true,
  // Validate regular expressions with runtime, default `true`
  validateRegex: false,
};

/**
@param {string} text
@param {SOURCE_TYPE_MODULE | SOURCE_TYPE_COMMONJS} sourceType
*/
function parseWithOptions(text, sourceType) {
  /** @type {MeriyahESTree.Comment[]} */
  const comments = [];

  const ast = meriyahParse(text, {
    ...parseOptions,
    sourceType,
    onComment: comments,
  });

  // @ts-expect-error -- Safe
  ast.comments = comments;

  return ast;
}

function createParseError(error) {
  const { description, loc } = error;

  /* c8 ignore next 3 */
  if (!loc) {
    return error;
  }

  return createError(description, {
    loc: {
      start: {
        line: loc.start.line,
        column: loc.start.column + 1,
      },
      end: {
        line: loc.end.line,
        column: loc.end.column + 1,
      },
    },
    cause: error,
  });
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

  return postprocess(ast, { parser: "meriyah", text });
}

export const meriyah = createParser(parse);
