import { parse as parseTypeScript } from "@typescript-eslint/typescript-estree";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";
import jsxRegexp from "./utils/jsx-regexp.evaluate.js";
import replaceHashbang from "./utils/replace-hashbang.js";
import {
  getSourceType,
  SOURCE_TYPE_COMBINATIONS,
} from "./utils/source-types.js";

/** @import {TSESTreeOptions} from "@typescript-eslint/typescript-estree" */

/** @type {TSESTreeOptions} */
const baseParseOptions = {
  // `jest@<=26.4.2` rely on `loc`
  // https://github.com/facebook/jest/issues/10444
  // Set `loc` and `range` to `true` also prevent AST traverse
  // https://github.com/typescript-eslint/typescript-eslint/blob/733b3598c17d3a712cf6f043115587f724dbe3ef/packages/typescript-estree/src/ast-converter.ts#L38
  loc: true,
  range: true,
  comment: true,
  tokens: false,
  loggerFn: false,
  project: false,
  jsDocParsingMode: "none",
  // TODO: Use new properties when update printer
  suppressDeprecatedPropertyWarnings: true,
};

function createParseError(error) {
  /* c8 ignore next 3 -- not a parse error */
  if (!error?.location) {
    return error;
  }

  const {
    message,
    location: { start, end },
  } = error;

  return createError(message, {
    loc: {
      start: { line: start.line, column: start.column + 1 },
      end: { line: end.line, column: end.column + 1 },
    },
    cause: error,
  });
}

// https://typescript-eslint.io/packages/parser/#jsx
const isKnownFileType = (filepath) =>
  filepath && /\.(?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$/iu.test(filepath);

function getParseOptionsCombinations(text, filepath) {
  let combinations = [{ ...baseParseOptions, filePath: filepath }];

  const sourceType = getSourceType(filepath);
  if (sourceType) {
    combinations = combinations.map((parseOptions) => ({
      ...parseOptions,
      sourceType,
    }));
  } else {
    combinations = SOURCE_TYPE_COMBINATIONS.flatMap((sourceType) =>
      combinations.map((parseOptions) => ({ ...parseOptions, sourceType })),
    );
  }

  if (isKnownFileType(filepath)) {
    return combinations;
  }

  const shouldEnableJsx = jsxRegexp.test(text);
  return [shouldEnableJsx, !shouldEnableJsx].flatMap((jsx) =>
    combinations.map((parseOptions) => ({ ...parseOptions, jsx })),
  );
}

function parse(text, options) {
  let filepath = options?.filepath;
  if (typeof filepath !== "string") {
    filepath = undefined;
  }

  const textToParse = replaceHashbang(text);
  const parseOptionsCombinations = getParseOptionsCombinations(text, filepath);

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

  return postprocess(ast, { parser: "typescript", text });
}

export const typescript = createParser(parse);
