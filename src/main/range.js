import * as assert from "#universal/assert";
import { childNodesCache } from "./comments/attach.js";
import getSortedChildNodes from "./utilities/get-sorted-child-nodes.js";

const isJsonParser = ({ parser }) =>
  parser === "json" ||
  parser === "json5" ||
  parser === "jsonc" ||
  parser === "json-stringify";

function findCommonAncestor(startNodeAndAncestors, endNodeAndAncestors) {
  endNodeAndAncestors = new Set(endNodeAndAncestors);
  return startNodeAndAncestors.find(
    (node) =>
      jsonSourceElements.has(node.type) && endNodeAndAncestors.has(node),
  );
}

function dropRootParents(parents) {
  const index = parents.findLastIndex(
    (node) => node.type !== "Program" && node.type !== "File",
  );

  if (index === -1) {
    return parents;
  }

  return parents.slice(0, index + 1);
}

function findSiblingAncestors(
  startNodeAndAncestors,
  endNodeAndAncestors,
  { locStart, locEnd },
) {
  let [resultStartNode, ...startNodeAncestors] = startNodeAndAncestors;
  let [resultEndNode, ...endNodeAncestors] = endNodeAndAncestors;

  if (resultStartNode === resultEndNode) {
    return [resultStartNode, resultEndNode];
  }

  const startNodeStart = locStart(resultStartNode);
  for (const endAncestor of dropRootParents(endNodeAncestors)) {
    if (locStart(endAncestor) >= startNodeStart) {
      resultEndNode = endAncestor;
    } else {
      break;
    }
  }

  const endNodeEnd = locEnd(resultEndNode);
  for (const startAncestor of dropRootParents(startNodeAncestors)) {
    if (locEnd(startAncestor) <= endNodeEnd) {
      resultStartNode = startAncestor;
    } else {
      break;
    }
    if (resultStartNode === resultEndNode) {
      break;
    }
  }

  return [resultStartNode, resultEndNode];
}

function findNodeAtOffset(
  node,
  offset,
  options,
  predicate,
  ancestors = [],
  type,
) {
  const { locStart, locEnd } = options;
  const start = locStart(node);
  const end = locEnd(node);

  if (
    offset > end ||
    offset < start ||
    (type === "rangeEnd" && offset === start) ||
    (type === "rangeStart" && offset === end)
  ) {
    return;
  }

  const nodeAndAncestors = [node, ...ancestors];
  const childNodes = getSortedChildNodes(node, nodeAndAncestors, {
    cache: childNodesCache,
    locStart,
    locEnd,
    getVisitorKeys: options.getVisitorKeys,
    // These two property should be removed, since we don't care if it can attach comment
    filter: options.printer.canAttachComment,
    getChildren: options.printer.getCommentChildNodes,
  });
  for (const child of childNodes) {
    const childAndAncestors = findNodeAtOffset(
      child,
      offset,
      options,
      predicate,
      nodeAndAncestors,
      type,
    );
    if (childAndAncestors) {
      return childAndAncestors;
    }
  }

  if (predicate(node, ancestors[0])) {
    return nodeAndAncestors;
  }
}

// See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5
function isJsSourceElement(type, parentType) {
  return (
    parentType !== "DeclareExportDeclaration" &&
    type !== "TypeParameterDeclaration" &&
    (type === "Directive" ||
      type === "TypeAlias" ||
      type === "TSExportAssignment" ||
      type.startsWith("Declare") ||
      type.startsWith("TSDeclare") ||
      type.endsWith("Statement") ||
      type.endsWith("Declaration"))
  );
}

const jsonSourceElements = new Set([
  "JsonRoot",
  "ObjectExpression",
  "ArrayExpression",
  "StringLiteral",
  "NumericLiteral",
  "BooleanLiteral",
  "NullLiteral",
  "UnaryExpression",
  "TemplateLiteral",
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
function isSourceElement(opts, node, parentNode) {
  /* c8 ignore next 3 */
  if (!node) {
    return false;
  }
  switch (opts.parser) {
    case "flow":
    case "hermes":
    case "babel":
    case "babel-flow":
    case "babel-ts":
    case "typescript":
    case "acorn":
    case "espree":
    case "meriyah":
    case "oxc":
    case "oxc-ts":
    case "__babel_estree":
      return isJsSourceElement(node.type, parentNode?.type);
    case "json":
    case "json5":
    case "jsonc":
    case "json-stringify":
      return jsonSourceElements.has(node.type);
    case "graphql":
      return graphqlSourceElements.has(node.kind);
    case "vue":
      return node.tag !== "root";
  }
  return false;
}

/**
@param {string} text
@param {*} opts
@param {*} ast
@returns {[number, number]}
*/
function calculateRange(text, opts, ast) {
  let { rangeStart: start, rangeEnd: end, locStart, locEnd } = opts;
  assert.ok(end > start);
  // Contract the range so that it has non-whitespace characters at its endpoints.
  // This ensures we can format a range that doesn't end on a node.
  const firstNonWhitespaceCharacterIndex = text.slice(start, end).search(/\S/u);
  const isAllWhitespace = firstNonWhitespaceCharacterIndex === -1;
  if (!isAllWhitespace) {
    start += firstNonWhitespaceCharacterIndex;
    for (; end > start; --end) {
      if (/\S/u.test(text[end - 1])) {
        break;
      }
    }
  }

  const startNodeAndAncestors = findNodeAtOffset(
    ast,
    start,
    opts,
    (node, parentNode) => isSourceElement(opts, node, parentNode),
    [],
    "rangeStart",
  );
  if (!startNodeAndAncestors) {
    return;
  }

  const endNodeAndAncestors =
    // No need find Node at `end`, it will be the same as `startNodeAndAncestors`
    isAllWhitespace
      ? startNodeAndAncestors
      : findNodeAtOffset(
          ast,
          end,
          opts,
          (node) => isSourceElement(opts, node),
          [],
          "rangeEnd",
        );
  if (!endNodeAndAncestors) {
    return;
  }

  let startNode;
  let endNode;
  if (isJsonParser(opts)) {
    const commonAncestor = findCommonAncestor(
      startNodeAndAncestors,
      endNodeAndAncestors,
    );
    startNode = commonAncestor;
    endNode = commonAncestor;
  } else {
    [startNode, endNode] = findSiblingAncestors(
      startNodeAndAncestors,
      endNodeAndAncestors,
      opts,
    );
  }

  return [
    Math.min(locStart(startNode), locStart(endNode)),
    Math.max(locEnd(startNode), locEnd(endNode)),
  ];
}

export { calculateRange };
