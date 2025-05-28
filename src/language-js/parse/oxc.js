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

async function parseWithOptions(filename, text, options) {
  const result = await oxcParse(filename, text, {
    preserveParens: true,
    experimentalRawTransfer: rawTransferSupported(),
    showSemanticErrors: false,
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

async function parseJs(text, options = {}) {
  const sourceType = getSourceType(options);
  let { filepath } = options;
  if (typeof filepath !== "string") {
    filepath = "prettier.jsx";
  }

  const { program: ast, comments } = await parseWithOptions(filepath, text, {
    sourceType,
    lang: "jsx",
  });

  // @ts-expect-error -- expected
  ast.comments = comments;

  return postprocess(ast, { text, parser: "oxc" });
}

async function parseTs(text, options = {}) {
  const sourceType = getSourceType(options);
  const parseOptions = { sourceType, astType: "ts" };
  let { filepath } = options;
  let isKnownJsx;
  if (typeof filepath === "string") {
    const extension = filepath.toLowerCase().split(".").at(-1);
    isKnownJsx = extension === "jsx" || extension === "tsx";
  } else {
    filepath = "prettier.tsx";
  }

  let parseOptionsCombinations = [];
  if (isKnownJsx) {
    parseOptionsCombinations = [{ ...parseOptions, lang: "tsx" }];
  } else {
    const shouldEnableJsx = isProbablyJsx(text);
    parseOptionsCombinations = [shouldEnableJsx, !shouldEnableJsx].map(
      (shouldEnableJsx) => ({
        ...parseOptions,
        lang: shouldEnableJsx ? "tsx" : "ts",
      }),
    );
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

/**
 * Use a naive regular expression to detect JSX
 * copied from typescript.js
 */
function isProbablyJsx(text) {
  return new RegExp(
    // eslint-disable-next-line regexp/no-useless-non-capturing-group -- possible bug
    [
      "(?:^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(?:^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "mu",
  ).test(text);
}

const oxc = createParser(parseJs);
const oxcTs = createParser(parseTs);

export { oxc, oxcTs as "oxc-ts" };
