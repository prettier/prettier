import indexToPosition from "index-to-position";
import * as oxcParser from "oxc-parser";
import createError from "../../common/parser-create-error.js";
import { tryCombinationsAsync } from "../../utils/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";
import jsxRegexp from "./utils/jsx-regexp.evaluate.js";
import { getSourceType } from "./utils/source-types.js";

/** @import {ParseResult, ParserOptions as ParserOptionsWithoutExperimentalRawTransfer} from "oxc-parser" */
/** @typedef {ParserOptionsWithoutExperimentalRawTransfer & {experimentalRawTransfer?: boolean}} ParserOptions */

function createParseError(error, { text }) {
  /* c8 ignore next 3 */
  if (!error?.labels?.[0]) {
    return error;
  }

  const {
    message,
    labels: [{ start: startIndex, end: endIndex }],
  } = error;

  const [start, end] = [startIndex, endIndex].map((index) =>
    indexToPosition(text, index, { oneBased: true }),
  );

  return createError(message, {
    loc: {
      start,
      end,
    },
    cause: error,
  });
}

/**
@param {string} filepath
@param {string} text
@param {ParserOptions} options
@returns {Promise<ParseResult>}
*/
async function parseWithOptions(filepath, text, options) {
  const result = await oxcParser.parseAsync(filepath, text, {
    preserveParens: true,
    showSemanticErrors: false,
    experimentalRawTransfer: oxcParser.rawTransferSupported(),
    ...options,
  });

  const { errors } = result;
  for (const error of errors) {
    if (
      error.severity === "Error" &&
      (error.message ===
        "A 'return' statement can only be used within a function body." ||
        /^Identifier `.*` has already been declared$/u.test(error.message))
    ) {
      continue;
    }
    throw createParseError(error, { text });
  }

  return result;
}

async function parseJs(text, options) {
  const filepath = options?.filepath;
  const sourceType = getSourceType(filepath);

  const { program: ast, comments } = await parseWithOptions(
    typeof filepath === "string" ? filepath : "prettier.jsx",
    text,
    {
      sourceType,
      lang: "jsx",
    },
  );

  // @ts-expect-error -- expected
  ast.comments = comments;

  return postprocess(ast, { text, parser: "oxc" });
}

async function parseTs(text, options) {
  let filepath = options?.filepath;
  const sourceType = getSourceType(filepath);
  /** @type {ParserOptions} */
  const parseOptions = { sourceType, astType: "ts" };
  const isKnownJsx =
    typeof filepath === "string" && /\.(?:jsx|tsx)$/iu.test(filepath);

  /** @type {ParserOptions[]} */
  let parseOptionsCombinations = [];
  if (isKnownJsx) {
    parseOptionsCombinations = [{ ...parseOptions, lang: "tsx" }];
  } else {
    const shouldEnableJsx = jsxRegexp.test(text);
    parseOptionsCombinations = [shouldEnableJsx, !shouldEnableJsx].map(
      (shouldEnableJsx) => ({
        ...parseOptions,
        lang: shouldEnableJsx ? "tsx" : "ts",
      }),
    );
  }

  if (typeof filepath !== "string") {
    filepath = "prettier.tsx";
  }

  let result;
  try {
    result = await tryCombinationsAsync(
      parseOptionsCombinations.map(
        (parseOptions) => () => parseWithOptions(filepath, text, parseOptions),
      ),
    );
  } catch ({
    // @ts-expect-error -- expected
    errors: [error],
  }) {
    throw error;
  }

  const { program: ast, comments } = result;
  // @ts-expect-error -- expected
  ast.comments = comments;
  return postprocess(ast, { text, parser: "oxc", oxcAstType: "ts" });
}

const oxc = createParser(parseJs);
const oxcTs = createParser(parseTs);

export { oxc, oxcTs as "oxc-ts" };
