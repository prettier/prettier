import { ConfigError } from "../common/errors.js";

function resolveParser({ plugins, parser }) {
  for (const { parsers } of plugins) {
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
    await handleParseError(error, originalText);
  }

  return { text, ast };
}

async function handleParseError(error, text) {
  const { loc } = error;

  if (loc) {
    const { codeFrameColumns } = await import("@babel/code-frame");
    const codeFrame = codeFrameColumns(text, loc, { highlightCode: true });
    error.message += "\n" + codeFrame;
    error.codeFrame = codeFrame;
    throw error;
  }

  /* c8 ignore next */
  throw error;
}

export { parse, resolveParser };
