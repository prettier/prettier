import flowParser from "flow-parser";
import createError from "../../common/parser-create-error.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";
import replaceHashbang from "./utils/replace-hashbang.js";

// https://github.com/facebook/flow/tree/main/packages/flow-parser#options
// Keep this sync with `/scripts/sync-flow-test.js`
const parseOptions = {
  // `all_comments` (boolean, default `true`) - include a list of all comments from the whole program
  // all_comments: true,
  // `comments` (boolean, default `true`) - attach comments to AST nodes (`leadingComments` and `trailingComments`)
  comments: false,
  // `components` (boolean, default `false`) - enable parsing of Flow component syntax
  components: true,
  // `enums` (boolean, default `false`) - enable parsing of Flow enums
  enums: true,
  // `esproposal_decorators` (boolean, default `false`) - enable parsing of decorators
  esproposal_decorators: true,
  // `esproposal_export_star_as` (boolean, default `false`) - enable parsing of `export * as` syntax
  esproposal_export_star_as: true,
  // `types` (boolean, default `true`) - enable parsing of Flow types
  // types: true,
  // `use_strict` (boolean, default `false`) - treat the file as strict, without needing a "use strict" directive
  // use_strict: false,
  // `tokens` (boolean, default `false`) - include a list of all parsed tokens in a top-level `tokens` property
  tokens: true,
};

function createParseError(error) {
  const {
    message,
    loc: { start, end },
  } = error;

  return createError(message, {
    loc: {
      start: { line: start.line, column: start.column + 1 },
      end: { line: end.line, column: end.column + 1 },
    },
    cause: error,
  });
}

function parse(text) {
  const ast = flowParser.parse(replaceHashbang(text), parseOptions);
  const [error] = ast.errors;
  if (error) {
    throw createParseError(error);
  }

  return postprocess(ast, { text });
}

export const flow = createParser(parse);
