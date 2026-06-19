import { parse as flowParse } from "flow-parser/oxidized/index.js";
import createError from "../../common/parser-create-error.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utilities/create-parser.js";

// https://github.com/facebook/flow/tree/main/packages/flow-parser/oxidized-src#options
// Keep this sync with `/scripts/sync-flow-test.js`
const parseOptions = {
  flow: "all",
  babel: false,
  tokens: false,
  allowReturnOutsideFunction: true,
  // `enableEnums` (boolean, default `true`) - enable parsing of enums https://flow.org/en/docs/enums/
  enableEnums: true,
  // `enableExperimentalFlowMatchSyntax` (boolean, default `true`) - enable parsing of match expressions and match statements https://flow.org/en/docs/match/
  enableExperimentalFlowMatchSyntax: true,
  // `enableExperimentalComponentSyntax` (boolean, default `true`) - enable parsing of Flow component syntax
  enableExperimentalComponentSyntax: true,
  // TODO: Support it
  // `assertOperator` (boolean, default `false`) - enable parsing of the assert operator
  // assertOperator: true,
  // `enableExperimentalDecorators` (boolean, default `true`) - enable parsing of decorators
  enableExperimentalDecorators: true,
  // `enableExperimentalFlowRecordSyntax` (boolean, default `true`) - enable parsing of records
  enableExperimentalFlowRecordSyntax: true,
};

function createParseError(error) {
  let { message } = error;
  const { loc } = error;

  /* c8 ignore next 3 */
  if (!loc) {
    return error;
  }

  const { line, column } = loc;
  const suffix = ` (${line}:${column})`;
  if (message.endsWith(suffix)) {
    message = message.slice(0, -suffix.length);
  }

  return createError(message, {
    loc: {
      start: { line, column: column + 1 },
    },
  });
}

function parse(text, options) {
  const filepath = options?.filepath;
  const sourceFilename =
    typeof filepath === "string" ? filepath : "prettier.js.flow";

  let ast;
  try {
    ast = flowParse(text, {
      sourceFilename,
      ...parseOptions,
    });
  } catch (error) {
    throw createParseError(error);
  }

  return postprocess(ast, { text, astType: "flow" });
}

export const flow = /* @__PURE__ */ createParser(parse);
