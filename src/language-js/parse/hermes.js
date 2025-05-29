import { parse as hermesParse } from "hermes-parser";
import createError from "../../common/parser-create-error.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";

function createParseError(error) {
  let { message, loc } = error;

  if (!loc) {
    return error;
  }

  const { line, column } = loc;

  message = message.split("\n")[0];

  const suffix = `(${line}:${column})`;
  if (message.endsWith(suffix)) {
    message = message.slice(0, -suffix.length);
  }
  message = message.trim();

  return createError(message, {
    loc: {
      start: { line, column },
    },
    cause: error,
  });
}

const parseOptions = {
  flow: "all",
  babel: false,
  // Not supported yet
  enableExperimentalFlowMatchSyntax: false,
  tokens: false,
  allowReturnOutsideFunction: true,
};

async function parse(text /*, options*/) {
  let ast;
  try {
    ast = await hermesParse(text, parseOptions);
  } catch (error) {
    throw createParseError(error);
  }

  return postprocess(ast, { text, parser: "hermes" });
}

export const hermes = createParser(parse);
