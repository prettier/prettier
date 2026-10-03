import { parse as parseTypeScript } from "@typescript-eslint/typescript-estree";
import ts from "typescript";
import createError from "../../common/parser-create-error.js";
import { tryCombinationsSync } from "../../utilities/try-combinations.js";
import postprocess from "./postprocess/index.js";
import visitNode from "./postprocess/visit-node.js";
import createParser from "./utilities/create-parser.js";
import jsxRegexp from "./utilities/jsx-regexp.evaluate.js";
import replaceHashbang from "./utilities/replace-hashbang.js";
import {
  getSourceType,
  SOURCE_TYPE_COMBINATIONS,
} from "./utilities/source-types.js";

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
  suppressDeprecatedPropertyWarnings: process.env.NODE_ENV === "production",
  onUnsupportedTypeScriptVersion: "ignore",
};

function createParseError(error) {
  const { message, location } = error;

  /* c8 ignore next 3 -- not a parse error */
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

// https://typescript-eslint.io/packages/parser/#jsx
const isKnownFileType = (filepath) =>
  filepath && /\.(?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$/i.test(filepath);

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

function checkMisplacedExportModifiers(ast, text) {
  if (!text.includes("export")) {
    return;
  }

  visitNode(ast, {
    onEnter(node) {
      if (
        node.type !== "ClassDeclaration" ||
        (!node.abstract && !node.declare)
      ) {
        return;
      }

      const start = node.range[0];
      const end = node.id?.range[0] ?? node.body.range[0];
      const header = text.slice(start, end);
      if (!header.includes("export")) {
        return;
      }

      // TypeScript recovers from `abstract export class` by omitting `export`
      // from the ESTree node. Reject it instead of changing the module's API.
      const scanner = ts.createScanner(
        ts.ScriptTarget.Latest,
        true,
        ts.LanguageVariant.Standard,
        header,
      );
      let token;
      while ((token = scanner.scan()) !== ts.SyntaxKind.EndOfFileToken) {
        if (token === ts.SyntaxKind.ClassKeyword) {
          break;
        }
        if (token !== ts.SyntaxKind.ExportKeyword) {
          continue;
        }

        const position = start + scanner.getTokenPos();
        const precedingText = text.slice(0, position);
        const line = precedingText.split("\n").length;
        const column = position - precedingText.lastIndexOf("\n");
        throw createError("'export' modifier must precede other modifiers.", {
          loc: {
            start: { line, column },
            end: { line, column: column + "export".length },
          },
        });
      }
    },
  });
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
    ast = tryCombinationsSync(
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

  checkMisplacedExportModifiers(ast, text);
  return postprocess(ast, { text, astType: "typescript" });
}

export const typescript = /* @__PURE__ */ createParser(parse);
