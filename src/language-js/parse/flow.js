import flowParser from "flow-parser";
import createError from "../../common/parser-create-error.js";
import { tryCombinationsSync } from "../../utilities/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utilities/create-parser.js";

// https://github.com/facebook/flow/tree/main/packages/flow-parser#options
// Keep this sync with `/scripts/sync-flow-test.js`
const parseOptions = {
  /* Basic options */
  // `types` (boolean, default true) - enable parsing of Flow types
  // types: true,
  // `use_strict` (boolean, default false) - treat the file as strict, without needing a "use strict" directive
  // use_strict: false,
  // `comments` (boolean, default `true`) - attach comments to AST nodes (`leadingComments` and `trailingComments`)
  comments: false,
  // `all_comments` (boolean, default `true`) - include a list of all comments from the whole program
  // all_comments: true,
  // `tokens` (boolean, default `false`) - include a list of all parsed tokens in a top-level `tokens` property
  // tokens: false,

  /* Language features */
  // `enums` (boolean, default `false`) - enable parsing of enums https://flow.org/en/docs/enums/
  enums: true,
  // `match` (boolean, default `false`) - enable parsing of match expressions and match statements https://flow.org/en/docs/match/
  match: true,
  // `components` (boolean, default `false`) - enable parsing of Flow component syntax
  components: true,
  // TODO: Support it
  // `assert_operator` (boolean, default `false`) - enable parsing of the assert operator
  // assert_operator: true,
  // `esproposal_decorators` (boolean, default `false`) - enable parsing of decorators
  esproposal_decorators: true,
  // Undocumented
  pattern_matching: true,
  // Undocumented
  records: true,
};

function createParseError(error) {
  const { message, loc } = error;

  /* c8 ignore next 3 */
  if (!loc) {
    return error;
  }

  const { start, end } = loc;

  return createError(message, {
    loc: {
      start: { line: start.line, column: start.column + 1 },
      end: { line: end.line, column: end.column + 1 },
    },
    cause: error,
  });
}

function parseWithOptions(text, options) {
  const ast = flowParser.parse(text, { ...parseOptions, ...options });
  const [error] = ast.errors;
  if (error) {
    throw createParseError(error);
  }

  return ast;
}

function parse(text, options) {
  const filepath = options?.filepath;
  const combinations = (
    typeof filepath === "string"
      ? [filepath]
      : ["prettier.js.flow", "prettier.js"]
  ).map((filename) => () => parseWithOptions(text, { filename }));

  let ast;

  try {
    ast = tryCombinationsSync(combinations);
  } catch ({
    // @ts-expect-error -- expected
    errors: [error],
  }) {
    throw createParseError(error);
  }

  return postprocess(ast, { parser: "flow", text });
}

export const flow = /* @__PURE__ */ createParser(parse);
