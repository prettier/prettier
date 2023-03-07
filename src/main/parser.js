import { codeFrameColumns } from "@babel/code-frame";
import { ConfigError } from "../common/errors.js";

function resolveParser({ plugins, parser }) {
  /*
  Loop from end to allow plugins override builtin plugins,
  this is how `resolveParser` works in v2.
  This is a temporarily solution, see #13729
  */
  for (let index = plugins.length - 1; index >= 0; index--) {
    const { parsers } = plugins[index];
    if (parsers && Object.hasOwn(parsers, parser)) {
      const parserOrParserInitFunction = parsers[parser];

      return typeof parserOrParserInitFunction === "function"
        ? parserOrParserInitFunction()
        : parserOrParserInitFunction;
    }
  }

  /* c8 ignore next 5 */
  if (process.env.PRETTIER_TARGET === "universal") {
    throw new ConfigError(
      `Couldn't resolve parser "${parser}". Parsers must be explicitly added to the standalone bundle.`
    );
  }
}

async function parse(originalText, options) {
  const parser = await resolveParser(options);
  const text = parser.preprocess
    ? parser.preprocess(originalText, options)
    : originalText;
  options.originalText = text;

  let ast;
  try {
    ast = await parser.parse(
      text,
      options,
      // TODO: remove the third argument in v4
      // The duplicated argument is passed as intended, see #10156
      options
    );
  } catch (error) {
    handleParseError(error, originalText);
  }

  return { text, ast };
}

function handleParseError(error, text) {
  const { loc } = error;

  if (loc) {
    const codeFrame = codeFrameColumns(text, loc, { highlightCode: true });
    error.message += "\n" + codeFrame;
    error.codeFrame = codeFrame;
    throw error;
  }

  /* c8 ignore next */
  throw error;
}

export { parse, resolveParser };
