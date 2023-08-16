import { parse as parseTypeScript } from "@typescript-eslint/typescript-estree";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import replaceHashbang from "./utils/replace-hashbang.js";
import postprocess from "./postprocess/index.js";

/** @type {import("@typescript-eslint/typescript-estree").TSESTreeOptions} */
const baseParseOptions = {
  // `jest@<=26.4.2` rely on `loc`
  // https://github.com/facebook/jest/issues/10444
  // Set `loc` and `range` to `true` also prevent AST traverse
  // https://github.com/typescript-eslint/typescript-eslint/blob/733b3598c17d3a712cf6f043115587f724dbe3ef/packages/typescript-estree/src/ast-converter.ts#L38
  loc: true,
  range: true,
  comment: true,
  tokens: true,
  loggerFn: false,
  project: [],
  // TODO: Use new properties when update printer
  suppressDeprecatedPropertyWarnings: true,
};

function createParseError(error) {
  const { message, location } = error;

  /* c8 ignore next 3 */
  if (!location) {
    return error;
  }

  const { start, end } = location;

  return createError(message, {
    loc: {
      start: { line: start.line, column: start.column + 1 },
      end: { line: end.line, column: end.column + 1 },
    },
    cause: error,
  });
}

// https://typescript-eslint.io/architecture/parser/#jsx
const isKnownFileType = (filepath) =>
  /\.(?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$/i.test(filepath);

function getParseOptionsCombinations(text, options) {
  const filepath = options?.filepath;
  if (filepath && isKnownFileType(filepath)) {
    return [{ ...baseParseOptions, filePath: filepath }];
  }

  const shouldEnableJsx = isProbablyJsx(text);
  return [
    { ...baseParseOptions, jsx: shouldEnableJsx },
    { ...baseParseOptions, jsx: !shouldEnableJsx },
  ];
}

function parse(text, options) {
  const textToParse = replaceHashbang(text);
  const parseOptionsCombinations = getParseOptionsCombinations(text, options);

  let ast;
  try {
    ast = tryCombinations(
      parseOptionsCombinations.map(
        (parseOptions) => () => parseTypeScript(textToParse, parseOptions),
      ),
    );
  } catch ({
    // @ts-expect-error -- expected
    errors: [
      // Suppose our guess is correct, throw the first error
      error,
    ],
  }) {
    throw createParseError(error);
  }

  return postprocess(ast, { text });
}

/**
 * Use a naive regular expression to detect JSX
 */
function isProbablyJsx(text) {
  return new RegExp(
    // eslint-disable-next-line regexp/no-useless-non-capturing-group -- possible bug
    [
      "(?:^[^\"'`]*</)", // Contains "</" when probably not in a string
      "|",
      "(?:^[^/]{2}.*/>)", // Contains "/>" on line not starting with "//"
    ].join(""),
    "m",
  ).test(text);
}

export const typescript = createParser(parse);
