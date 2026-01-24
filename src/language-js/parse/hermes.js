import { parse as hermesParse } from "hermes-parser";
import createError from "../../common/parser-create-error.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utilities/create-parser.js";

function createParseError(error) {
  const { loc } = error;

  /* c8 ignore next 3 */
  if (!loc) {
    return error;
  }

  const { line, column } = loc;
  let [message] = error.message.split("\n");

  const suffix = ` (${line}:${column})`;
  if (message.endsWith(suffix)) {
    message = message.slice(0, -suffix.length);
  }

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
  // enableExperimentalComponentSyntax: true, // Enable by default
  // enableExperimentalFlowMatchSyntax: true, // Enable by default
  tokens: false,
  allowReturnOutsideFunction: true,
};

async function parse(text /* , options*/) {
  let ast;
  try {
    ast = await hermesParse(text, parseOptions);
  } catch (error) {
    throw createParseError(error);
  }

  return postprocess(ast, { text, astType: "hermes" });
}

export const hermes = /* @__PURE__ */ createParser(parse);
