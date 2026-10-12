import { parse as parseTypeScript } from "@typescript-eslint/typescript-estree";
import indexToPosition from "index-to-position";
import createError from "../../common/parser-create-error.js";
import isObject from "../../utilities/is-object.js";
import { tryCombinationsSync } from "../../utilities/try-combinations.js";
import postprocess from "./postprocess/index.js";
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

// `typescript-estree` only converts a leading `export` modifier into an
// `ExportNamedDeclaration`/`ExportDefaultDeclaration`. An `export` modifier
// after another modifier (eg `abstract export class A {}`) is silently dropped
// from the AST. The other TypeScript parsers throw on misplaced modifiers, and
// `tsc` reports them as errors (TS1029 "'export' modifier must precede ..."),
// so we throw here instead of formatting code with a silently removed `export`.
// https://github.com/prettier/prettier/issues/20166
const misplacedExportNodeKeywords = new Map([
  ["ClassDeclaration", ["class"]],
  ["ClassExpression", ["class"]],
  ["TSInterfaceDeclaration", ["interface"]],
  ["TSEnumDeclaration", ["enum"]],
  ["TSModuleDeclaration", ["module", "namespace"]],
  ["TSTypeAliasDeclaration", ["type"]],
  ["FunctionDeclaration", ["function"]],
  ["TSDeclareFunction", ["function"]],
  ["VariableDeclaration", ["const", "let", "var", "using", "await"]],
  ["TSImportEqualsDeclaration", ["import"]],
]);

/**
 * Scan the modifiers of `node` (the text between the start of the node and its
 * declaration keyword) for a misplaced `export` modifier.
 *
 * @returns {{index: number, firstModifier: string|undefined}|undefined}
 */
function findMisplacedExportModifier(text, node, keywords) {
  const start = node.range?.[0];
  if (typeof start !== "number") {
    return;
  }

  let index = start;
  let firstModifier;
  while (index < text.length) {
    const character = text[index];
    if (/\s/.test(character)) {
      index++;
      continue;
    }
    if (character === "/" && text[index + 1] === "/") {
      const lineEnd = text.indexOf("\n", index + 2);
      index = lineEnd === -1 ? text.length : lineEnd + 1;
      continue;
    }
    if (character === "/" && text[index + 1] === "*") {
      const commentEnd = text.indexOf("*/", index + 2);
      if (commentEnd === -1) {
        return;
      }
      index = commentEnd + 2;
      continue;
    }
    // Bail out on decorators instead of risking a false positive,
    // eg `@foo("export") class A {}`
    if (character === "@") {
      return;
    }
    const word = /^[_$a-z][\w$]*/i.exec(text.slice(index))?.[0];
    if (word === undefined) {
      return;
    }
    if (keywords.includes(word)) {
      return;
    }
    if (word === "export") {
      return { index, firstModifier };
    }
    firstModifier ??= word;
    index += word.length;
  }
}

function visitNodeForMisplacedExportModifier(node, parent, text) {
  if (Array.isArray(node)) {
    for (const element of node) {
      visitNodeForMisplacedExportModifier(element, parent, text);
    }
    return;
  }
  if (!isObject(node) || typeof node.type !== "string") {
    return;
  }
  if (
    parent?.type !== "ExportNamedDeclaration" &&
    parent?.type !== "ExportDefaultDeclaration"
  ) {
    const keywords = misplacedExportNodeKeywords.get(node.type);
    if (keywords) {
      const misplaced = findMisplacedExportModifier(text, node, keywords);
      if (misplaced) {
        const { index, firstModifier } = misplaced;
        throw createError(
          `'export' modifier must precede '${firstModifier ?? "declaration"}' modifier.`,
          {
            loc: {
              start: indexToPosition(text, index, { oneBased: true }),
              end: indexToPosition(text, index + "export".length, {
                oneBased: true,
              }),
            },
          },
        );
      }
    }
  }
  for (const value of Object.values(node)) {
    visitNodeForMisplacedExportModifier(value, node, text);
  }
}

function assertNoMisplacedExportModifier(ast, text) {
  if (!text.includes("export")) {
    return;
  }
  visitNodeForMisplacedExportModifier(ast, undefined, text);
}

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

  assertNoMisplacedExportModifier(ast, textToParse);

  return postprocess(ast, { text, astType: "typescript" });
}

export const typescript = /* @__PURE__ */ createParser(parse);
