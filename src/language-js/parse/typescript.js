import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import replaceHashbang from "./utils/replace-hashbang.js";
import postprocess from "./postprocess/index.js";

/** @type {import("@typescript-eslint/typescript-estree").TSESTreeOptions} */
const parseOptions = {
  // `jest@<=26.4.2` rely on `loc`
  // https://github.com/facebook/jest/issues/10444
  loc: true,
  range: true,
  comment: true,
  jsx: true,
  tokens: true,
  loggerFn: false,
  project: [],
};

function createParseError(error) {
  const { message, lineNumber, column } = error;

  /* istanbul ignore next */
  if (typeof lineNumber !== "number") {
    return error;
  }

  return createError(message, {
    loc: {
      start: { line: lineNumber, column: column + 1 },
    },
    cause: error,
  });
}

async function parse(text, options = {}) {
  const textToParse = replaceHashbang(text);
  const jsx = isProbablyJsx(text);

  const { parseWithNodeMaps } = await import(
    "@typescript-eslint/typescript-estree/dist/parser.js"
  );
  const { result, error: firstError } = tryCombinations(
    // Try passing with our best guess first.
    () => parseWithNodeMaps(textToParse, { ...parseOptions, jsx }),
    // But if we get it wrong, try the opposite.
    () => parseWithNodeMaps(textToParse, { ...parseOptions, jsx: !jsx })
  );

  if (!result) {
    // Suppose our guess is correct, throw the first error
    throw createParseError(firstError);
  }

  options.originalText = text;
  options.tsParseResult = result;
  return postprocess(result.ast, options);
}

/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    [
      "(?:^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(?:^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "m"
  ).test(text);
}

// Export as a plugin so we can reuse the same bundle for UMD loading
const parser = {
  parsers: {
    typescript: createParser(parse),
  },
};

export default parser;
