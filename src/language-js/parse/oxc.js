import { parseAsync as oxcParse } from "oxc-parser";
import createError from "../../common/parser-create-error.js";
import { tryCombinationsAsync } from "../../utils/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";
import getSourceType from "./utils/get-source-type.js";

function createParseError(error, magicString) {
  const {
    message,
    labels: [{ start: startIndex, end: endIndex }],
  } = error;

  const [start, end] = [startIndex, endIndex].map((index) => {
    const loc = magicString.getLineColumnNumber(index);
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

async function parseWithOptions(filename, text, sourceType) {
  const result = await oxcParse(filename, text, {
    sourceType,
    lang: "js",
    preserveParens: false,
  });

  const { errors } = result;
  for (const error of errors) {
    throw createParseError(error, result.magicString);
  }

  return result;
}

async function parse(text, options = {}) {
  const sourceType = getSourceType(options);
  let { filepath } = options;
  if (typeof filepath !== "string") {
    filepath = "prettier.js";
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

  return postprocess(ast, { text });
}

export const oxc = createParser(parse);
