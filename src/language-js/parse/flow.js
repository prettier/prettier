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

function offsetNodePositions(node, rangeOffset, lineOffset, columnOffset) {
  if (!node || typeof node !== "object") {
    return;
  }

  if (node.loc) {
    for (const key of ["start", "end"]) {
      const position = node.loc[key];
      position.column += position.line === 1 ? columnOffset : 0;
      position.line += lineOffset;
    }
  }

  if (node.range) {
    node.range[0] += rangeOffset;
    node.range[1] += rangeOffset;
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) {
        offsetNodePositions(child, rangeOffset, lineOffset, columnOffset);
      }
    } else {
      offsetNodePositions(value, rangeOffset, lineOffset, columnOffset);
    }
  }
}

function repairDeclareVariable(node, text, sourceFilename) {
  if (
    node.type !== "DeclareVariable" ||
    Array.isArray(node.declarations) ||
    !node.id?.range
  ) {
    return;
  }

  const [start, end] = node.range;
  const prefixLength = node.id.range[0] - start;
  if (prefixLength < 3) {
    return;
  }

  // Oxidized currently omits extra declarators and initializers on DeclareVariable.
  let declaration;
  try {
    declaration = flowParse(
      "let" +
        " ".repeat(prefixLength - 3) +
        text.slice(start + prefixLength, end),
      { ...parseOptions, sourceFilename },
    ).body[0];
  } catch {
    return;
  }

  if (declaration?.type !== "VariableDeclaration") {
    return;
  }

  offsetNodePositions(
    declaration,
    start,
    node.loc.start.line - 1,
    node.loc.start.column,
  );
  node.declarations = declaration.declarations;
}

function repairAst(ast, text, sourceFilename) {
  const visited = new WeakSet();

  function visit(node) {
    if (!node || typeof node !== "object" || visited.has(node)) {
      return;
    }

    visited.add(node);
    repairDeclareVariable(node, text, sourceFilename);

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value) {
          visit(child);
        }
      } else {
        visit(value);
      }
    }
  }

  visit(ast);
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

  repairAst(ast, text, sourceFilename);

  return postprocess(ast, { text, astType: "flow" });
}

export const flow = /* @__PURE__ */ createParser(parse);
