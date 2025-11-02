import { codeFrameColumns } from "@babel/code-frame";
import { resolveParser } from "./parser-and-printer.js";

async function parse(originalText, options) {
  const parser = await resolveParser(options);
  const text = parser.preprocess
    ? await parser.preprocess(originalText, options)
    : originalText;
  options.originalText = text;

  let ast;
  try {
    ast = await parser.parse(
      text,
      options,
      // TODO: remove the third argument in v4
      // The duplicated argument is passed as intended, see #10156
      options,
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

export default parse;
