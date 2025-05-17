import { parse as meriyahParse } from "meriyah";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";
import getSourceType from "./utils/get-source-type.js";

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
  // Allow return in the global scope
  globalReturn: true,
  // Enable implied strict mode
  impliedStrict: false,
  // Enable non-standard parenthesized expression node
  preserveParens: false,
  // Enable lexical binding and scope tracking
  lexical: false,
  // Adds a source attribute in every node’s loc object when the locations option is `true`
  // source: false,
  // Enable React JSX parsing
  jsx: true,
  // Creates unique key for in ObjectPattern when key value are same
  uniqueKeyInPattern: false,
};

function parseWithOptions(text, sourceType) {
  const comments = [];

  /** @type {any} */
  const ast = meriyahParse(text, {
    ...parseOptions,
    module: sourceType === "module",
    onComment: comments,
  });
  ast.comments = comments;

  return ast;
}

function createParseError(error) {
  let { message, loc } = error;

  /* c8 ignore next 3 */
  if (!loc) {
    return error;
  }

  const prefix = `[${[loc.start, loc.end].map(({ line, column }) => [line, column].join(":")).join("-")}]: `;
  if (message.startsWith(prefix)) {
    message = message.slice(prefix.length);
  }

  return createError(message, {
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

  return postprocess(ast, { parser: "meriyah", text });
}

export const meriyah = createParser(parse);
