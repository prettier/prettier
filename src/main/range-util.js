"use strict";

const comments = require("./comments");

function findSiblingAncestors(startNodeAndParents, endNodeAndParents, opts) {
  let resultStartNode = startNodeAndParents.node;
  let resultEndNode = endNodeAndParents.node;

  if (resultStartNode === resultEndNode) {
    return {
      startNode: resultStartNode,
      endNode: resultEndNode,
    };
  }

  for (const endParent of endNodeAndParents.parentNodes) {
    if (
      endParent.type !== "Program" &&
      endParent.type !== "File" &&
      opts.locStart(endParent) >= opts.locStart(startNodeAndParents.node)
    ) {
      resultEndNode = endParent;
    } else {
      break;
    }
  }

  for (const startParent of startNodeAndParents.parentNodes) {
    if (
      startParent.type !== "Program" &&
      startParent.type !== "File" &&
      opts.locEnd(startParent) <= opts.locEnd(endNodeAndParents.node)
    ) {
      resultStartNode = startParent;
    } else {
      break;
    }
  }

  return {
    startNode: resultStartNode,
    endNode: resultEndNode,
  };
}

function findNodeAtOffset(node, offset, options, predicate, parentNodes = []) {
  const start = options.locStart(node);
  const end = options.locEnd(node);
  if (start <= offset && offset <= end) {
    for (const childNode of comments.getSortedChildNodes(node, options)) {
      const childResult = findNodeAtOffset(
        childNode,
        offset,
        options,
        predicate,
        [node, ...parentNodes]
      );
      if (childResult) {
        return childResult;
      }
    }

    if (!predicate || predicate(node)) {
      return {
        node,
        parentNodes,
      };
    }
  }
}

// See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5

// JS and JS like to avoid repetitions
const jsSourceElements = new Set([
  "FunctionDeclaration",
  "BlockStatement",
  "BreakStatement",
  "ContinueStatement",
  "DebuggerStatement",
  "DoWhileStatement",
  "EmptyStatement",
  "ExpressionStatement",
  "ForInStatement",
  "ForStatement",
  "IfStatement",
  "LabeledStatement",
  "ReturnStatement",
  "SwitchStatement",
  "ThrowStatement",
  "TryStatement",
  "VariableDeclaration",
  "WhileStatement",
  "WithStatement",
  "ClassDeclaration", // ES 2015
  "ImportDeclaration", // Module
  "ExportDefaultDeclaration", // Module
  "ExportNamedDeclaration", // Module
  "ExportAllDeclaration", // Module
  "TypeAlias", // Flow
  "InterfaceDeclaration", // Flow, TypeScript
  "TypeAliasDeclaration", // TypeScript
  "ExportAssignment", // TypeScript
  "ExportDeclaration", // TypeScript
]);
const jsonSourceElements = new Set([
  "ObjectExpression",
  "ArrayExpression",
  "StringLiteral",
  "NumericLiteral",
  "BooleanLiteral",
  "NullLiteral",
]);
const graphqlSourceElements = new Set([
  "OperationDefinition",
  "FragmentDefinition",
  "VariableDefinition",
  "TypeExtensionDefinition",
  "ObjectTypeDefinition",
  "FieldDefinition",
  "DirectiveDefinition",
  "EnumTypeDefinition",
  "EnumValueDefinition",
  "InputValueDefinition",
  "InputObjectTypeDefinition",
  "SchemaDefinition",
  "OperationTypeDefinition",
  "InterfaceTypeDefinition",
  "UnionTypeDefinition",
  "ScalarTypeDefinition",
]);
function isSourceElement(opts, node) {
  if (node == null) {
    return false;
  }
  switch (opts.parser) {
    case "flow":
    case "babel":
    case "babel-flow":
    case "babel-ts":
    case "typescript":
      return jsSourceElements.has(node.type);
    case "json":
      return jsonSourceElements.has(node.type);
    case "graphql":
      return graphqlSourceElements.has(node.kind);
    case "vue":
      return node.tag !== "root";
  }
  return false;
}

function calculateRange(text, opts, ast) {
  // Contract the range so that it has non-whitespace characters at its endpoints.
  // This ensures we can format a range that doesn't end on a node.
  const rangeStringOrig = text.slice(opts.rangeStart, opts.rangeEnd);
  const startNonWhitespace = Math.max(
    opts.rangeStart + rangeStringOrig.search(/\S/),
    opts.rangeStart
  );
  let endNonWhitespace;
  for (
    endNonWhitespace = opts.rangeEnd;
    endNonWhitespace > opts.rangeStart;
    --endNonWhitespace
  ) {
    if (/\S/.test(text[endNonWhitespace - 1])) {
      break;
    }
  }

  const startNodeAndParents = findNodeAtOffset(
    ast,
    startNonWhitespace,
    opts,
    (node) => isSourceElement(opts, node)
  );
  const endNodeAndParents = findNodeAtOffset(
    ast,
    endNonWhitespace,
    opts,
    (node) => isSourceElement(opts, node)
  );

  if (!startNodeAndParents || !endNodeAndParents) {
    return {
      rangeStart: 0,
      rangeEnd: 0,
    };
  }

  const { startNode, endNode } = findSiblingAncestors(
    startNodeAndParents,
    endNodeAndParents,
    opts
  );

  return {
    rangeStart: Math.min(opts.locStart(startNode), opts.locStart(endNode)),
    rangeEnd: Math.max(opts.locEnd(startNode), opts.locEnd(endNode)),
  };
}

module.exports = {
  calculateRange,
  findNodeAtOffset,
};
