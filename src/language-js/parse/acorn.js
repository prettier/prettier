import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import createParser from "./utils/create-parser.js";
import postprocess from "./postprocess/index.js";

/** @type {import("acorn").Options} */
const parseOptions = {
  ecmaVersion: "latest",
  sourceType: "module",
  allowReserved: true,
  allowReturnOutsideFunction: true,
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  allowSuperOutsideMethod: true,
  allowHashBang: true,
  locations: true,
  ranges: true,
};

function createParseError(error) {
  const { message, loc } = error;

  /* istanbul ignore next */
  if (!loc) {
    return error;
  }

  const { line, column } = loc;

  return createError(message.replace(/ \(\d+:\d+\)$/, ""), {
    start: { line, column: column + 1 },
  });
}

let acornParse;
async function parseWithOptions(text, sourceType) {
  if (!acornParse) {
    const { Parser: AcornParser } = await import("acorn");
    const { default: acornJsx } = await import("acorn-jsx");
    const acornParser = AcornParser.extend(acornJsx());
    acornParse = acornParse.parse.bind(acornParser);
  }

  const comments = [];
  const tokens = [];

  /** @type {any} */
  const ast = acornParse(text, {
    ...parseOptions,
    sourceType,
    onComment: comments,
    onToken: tokens,
  });
  ast.comments = comments;
  ast.tokens = tokens;

  return ast;
}

async function parse(text, parsers, options = {}) {
  const { result: ast, error: moduleParseError } = await tryCombinations(
    () => parseWithOptions(text, /* sourceType */ "module"),
    () => parseWithOptions(text, /* sourceType */ "script")
  );

  if (!ast) {
    // throw the error for `module` parsing
    throw createParseError(moduleParseError);
  }

  options.originalText = text;
  return postprocess(ast, options);
}

export default createParser(parse);
