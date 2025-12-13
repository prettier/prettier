import indexToPosition from "index-to-position";
import { parse as oxcParse } from "oxc-parser";
import createError from "../../common/parser-create-error.js";
import { tryCombinations } from "../../utilities/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utilities/create-parser.js";
import jsxRegexp from "./utilities/jsx-regexp.evaluate.js";
import {
  getSourceType,
  SOURCE_TYPE_COMMONJS,
  SOURCE_TYPE_SCRIPT,
} from "./utilities/source-types.js";

/** @import {ParseResult, ParserOptions as ParserOptionsWithoutExperimentalRawTransfer} from "oxc-parser" */
/** @typedef {Omit<ParserOptionsWithoutExperimentalRawTransfer, "sourceType"> & {
  sourceType?: ParserOptionsWithoutExperimentalRawTransfer["sourceType"] | "commonjs",
  experimentalRawTransfer?: boolean,
}} ParserOptions */

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
  let { sourceType } = options;
  // https://github.com/oxc-project/oxc/issues/16200
  if (sourceType === SOURCE_TYPE_COMMONJS) {
    sourceType = SOURCE_TYPE_SCRIPT;
  }

  const result = await oxcParse(filepath, text, {
    preserveParens: true,
    showSemanticErrors: false,
    ...options,
    sourceType,
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

/**
@returns {ParserOptions["lang"][]}
*/
function getLanguageCombinations(text, options) {
  const filepath = options?.filepath;

  if (typeof filepath === "string") {
    if (/\.(?:jsx|tsx)$/iu.test(filepath)) {
      return ["tsx"];
    }

    if (filepath.toLowerCase().endsWith(".d.ts")) {
      return ["dts"];
    }
  }

  const shouldEnableJsx = jsxRegexp.test(text);
  return shouldEnableJsx ? ["tsx", "ts", "dts"] : ["ts", "tsx", "dts"];
}

async function parseTs(text, options) {
  let filepath = options?.filepath;
  const sourceType = getSourceType(filepath);
  const languageCombinations = getLanguageCombinations(text, options);

  if (typeof filepath !== "string") {
    filepath = "prettier.tsx";
  }

  let result;
  try {
    result = await tryCombinations(
      languageCombinations.map(
        (language) => () =>
          parseWithOptions(filepath, text, {
            sourceType,
            astType: "ts",
            lang: language,
          }),
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

const oxc = /* @__PURE__ */ createParser(parseJs);
const oxcTs = /* @__PURE__ */ createParser(parseTs);

export { oxc, oxcTs as "oxc-ts" };
