import indexToPosition from "index-to-position";
import { parseAsync as oxcParse, rawTransferSupported } from "oxc-parser";
import createError from "../../common/parser-create-error.js";
import { tryCombinationsAsync } from "../../utils/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";
import getSourceType from "./utils/get-source-type.js";

function createParseError(error, { text }) {
  const {
    message,
    labels: [{ start: startIndex, end: endIndex }],
  } = error;

  const [start, end] = [startIndex, endIndex].map((index) => {
    const loc = indexToPosition(text, index);
    loc.column += 1;
    return loc;
  });

  return createError(message, {
    loc: {
      start,
      end,
    },
    cause: error,
  });
}

let cachedIsRawTransferSupported;
const isRawTransferSupported = () => {
  cachedIsRawTransferSupported ??= rawTransferSupported();
  return cachedIsRawTransferSupported;
};

async function parseWithOptions(filename, text, sourceType) {
  const result = await oxcParse(filename, text, {
    sourceType,
    lang: "jsx",
    preserveParens: false,
    experimentalRawTransfer: isRawTransferSupported(),
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

async function parse(text, options = {}) {
  const sourceType = getSourceType(options);
  let { filepath } = options;
  if (typeof filepath !== "string") {
    filepath = "prettier.jsx";
  }

  const combinations = (sourceType ? [sourceType] : ["module", "script"]).map(
    (sourceType) => () => parseWithOptions(filepath, text, sourceType),
  );

  let result;
  try {
    result = await tryCombinationsAsync(combinations);
  } catch (/** @type {any} */ { errors: [error] }) {
    throw error;
  }

  const { program: ast, comments } = result;
  ast.comments = comments;

  return postprocess(ast, { text, parser: "oxc" });
}

export const oxc = createParser(parse);
