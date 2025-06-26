import { scss as postcssScssParse } from "sass-parser";
import createError from "../common/parser-create-error.js";
import parseFrontMatter from "../utils/front-matter/parse.js";
import { calculateLoc, locEnd, locStart } from "./loc.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";

function parseWithParser(parse, text, options) {
  const parsed = parseFrontMatter(text);
  const { frontMatter } = parsed;
  text = parsed.content;

  let result;

  try {
    result = parse(text, {
      // Prevent file access https://github.com/postcss/postcss/blob/4f4e2932fc97e2c117e1a4b15f0272ed551ed59d/lib/previous-map.js#L18
      map: false,
    });
  } catch (/** @type {any} */ error) {
    const { name, reason, line, column } = error;
    /* c8 ignore 3 */
    if (typeof line !== "number") {
      throw error;
    }

    throw createError(`${name}: ${reason}`, {
      loc: { start: { line, column } },
      cause: error,
    });
  }

  options.originalText = text;

  calculateLoc(result, text);

  if (frontMatter) {
    frontMatter.source = {
      startOffset: 0,
      endOffset: frontMatter.raw.length,
    };
    result.frontMatter = frontMatter;
  }

  return result;
}

function parseScss(text, options = {}) {
  return parseWithParser(
    (text, opts) => postcssScssParse.parse(text, opts),
    text,
    options,
  );
}

const postCssParser = {
  astFormat: "postcss",
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
};

export const sassparser = { ...postCssParser, parse: parseScss };
