import {
  isClassProperty,
  isStatementWithContentEnd,
} from "../utilities/node-types.js";
import { locEndWithFullText } from "./end-with-full-text.js";
import { locStart } from "./start.js";

/**
@import {Node, Comment, NodeMap} from "../types/estree.js";
@typedef {typeof locEnd} LocEnd
*/

/**
@template {Node} [InputNode = Node]
@typedef {(node: InputNode) => number} LocEndOverride
*/

const BREAK_KEYWORD_LENGTH = "break".length;
const CONTINUE_KEYWORD_LENGTH = "continue".length;
const DEBUGGER_KEYWORD_LENGTH = "debugger".length;

const overrideBreakOrContinueEnd =
  /**
  @param {BREAK_KEYWORD_LENGTH | CONTINUE_KEYWORD_LENGTH} keywordLength
  @returns {LocEndOverride<NodeMap["BreakStatement"] | NodeMap["ContinueStatement"]>}
  */
  (keywordLength) => (node) =>
    node.label ? locEnd(node.label) : locStart(node) + keywordLength;
/** @type {LocEndOverride} */
const getContentEnd = (node) => node.__contentEnd ?? locEndWithFullText(node);

/**
@param {Node | Comment} node
*/
function shouldAddContentEnd(node) {
  return isStatementWithContentEnd(node) || isClassProperty(node);
}

const overrides = new Map([
  ["BreakStatement", overrideBreakOrContinueEnd(BREAK_KEYWORD_LENGTH)],
  ["ContinueStatement", overrideBreakOrContinueEnd(CONTINUE_KEYWORD_LENGTH)],
  ["DebuggerStatement", (node) => locStart(node) + DEBUGGER_KEYWORD_LENGTH],
  // @ts-expect-error -- ignore
  ["VariableDeclaration", (node) => locEnd(node.declarations.at(-1))],
]);

/**
@param {Node | Comment} node
@return {number}
*/
function locEnd(node) {
  const { type } = node;

  // Effected by children
  if (type === "IfStatement") {
    return locEnd(node.alternate ?? node.consequent);
  }

  if (
    type === "ForInStatement" ||
    type === "ForOfStatement" ||
    type === "ForStatement" ||
    type === "LabeledStatement" ||
    type === "WithStatement" ||
    type === "WhileStatement"
  ) {
    return locEnd(node.body);
  }

  if (shouldAddContentEnd(node)) {
    return getContentEnd(node);
  }

  return (
    overrides.get(type)?.(
      // @ts-expect-error -- Comment types
      node,
    ) ?? locEndWithFullText(node)
  );
}

export { locEnd, shouldAddContentEnd };
