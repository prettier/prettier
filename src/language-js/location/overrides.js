import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
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

const nodeTypesWithContentEnd = /** @type {const} */ ([
  "ExpressionStatement",
  "Directive",
  "ImportDeclaration",
  "ExportDefaultDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
  "ReturnStatement",
  "ThrowStatement",
  "DoWhileStatement",
]);

const overrides =
  // @ts-expect-error -- Unknown
  new Map([
    ["BreakStatement", overrideBreakOrContinueEnd(BREAK_KEYWORD_LENGTH)],
    ["ContinueStatement", overrideBreakOrContinueEnd(CONTINUE_KEYWORD_LENGTH)],
    ["DebuggerStatement", (node) => locStart(node) + DEBUGGER_KEYWORD_LENGTH],
    // @ts-expect-error -- ignore
    ["VariableDeclaration", (node) => locEnd(node.declarations.at(-1))],
    ...nodeTypesWithContentEnd.map((type) => [type, getContentEnd]),
  ]);

const shouldAddContentEnd = createTypeCheckFunction(nodeTypesWithContentEnd);

const shouldIgnoredNodePrintSemicolon = (node) => {
  const { type } = node;

  if (
    type === "BreakStatement" ||
    type === "ContinueStatement" ||
    type === "DebuggerStatement" ||
    type === "VariableDeclaration" ||
    (shouldAddContentEnd(node) && node.__contentEnd)
  ) {
    return true;
  }

  if (type === "IfStatement") {
    return shouldIgnoredNodePrintSemicolon(node.alternate ?? node.consequent);
  }

  if (
    type === "ForInStatement" ||
    type === "ForOfStatement" ||
    type === "ForStatement" ||
    type === "LabeledStatement" ||
    type === "WithStatement" ||
    type === "WhileStatement"
  ) {
    return shouldIgnoredNodePrintSemicolon(node.body);
  }

  return false;
};

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

  return (
    overrides.get(type)?.(
      // @ts-expect-error -- Comment types
      node,
    ) ?? locEndWithFullText(node)
  );
}

export { locEnd, shouldAddContentEnd, shouldIgnoredNodePrintSemicolon };
