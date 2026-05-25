import * as assert from "#universal/assert";
import { childNodesCache } from "./comments/attach.js";
import getSortedChildNodes from "./utilities/get-sorted-child-nodes.js";

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
  locFunctions,
) {
  const { locStart, locEnd } = locFunctions;
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
      locFunctions,
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

// Nodes that create a new `yield` binding scope. A YieldExpression below such
// a node is bound by it. Arrow functions are intentionally excluded — they are
// transparent to the surrounding generator's yield context.
const jsYieldScopeTypes = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ObjectMethod",
  "ClassMethod",
  "ClassPrivateMethod",
  "TSDeclareFunction",
]);

// A slice of source text is reparsed standalone during range formatting. If
// the slice contains a YieldExpression whose binding generator function is
// outside the slice, the parser will fall back to treating `yield` as an
// identifier (e.g. `yield [1, 2]` becomes `yield[(1, 2)]`). Detect that case
// so the predicate can climb to a wider source element that does include the
// enclosing generator. See https://github.com/prettier/prettier/issues/16167.
function jsRangeLeaksYield(root, opts) {
  if (jsYieldScopeTypes.has(root.type)) {
    return false;
  }

  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || typeof node !== "object") {
      continue;
    }
    if (Array.isArray(node)) {
      for (const child of node) {
        stack.push(child);
      }
      continue;
    }
    if (typeof node.type !== "string") {
      continue;
    }
    if (node !== root && jsYieldScopeTypes.has(node.type)) {
      continue;
    }
    if (node.type === "YieldExpression") {
      return true;
    }
    for (const key of opts.getVisitorKeys(node)) {
      stack.push(node[key]);
    }
  }
  return false;
}

function isJsParser(parser) {
  switch (parser) {
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
      return true;
  }
  return false;
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
  let { rangeStart: start, rangeEnd: end } = opts;
  assert.ok(end > start);
  // Contract the range so that it has non-whitespace characters at its endpoints.
  // This ensures we can format a range that doesn't end on a node.
  const firstNonWhitespaceCharacterIndex = text.slice(start, end).search(/\S/);
  const isAllWhitespace = firstNonWhitespaceCharacterIndex === -1;
  if (!isAllWhitespace) {
    start += firstNonWhitespaceCharacterIndex;
    for (; end > start; --end) {
      if (/\S/.test(text[end - 1])) {
        break;
      }
    }
  }

  const locFunctions =
    opts.printer.features?.experimental_locForRangeFormat ?? opts;
  const isJs = isJsParser(opts.parser);
  const isSafeRangeRoot = (node) => !isJs || !jsRangeLeaksYield(node, opts);
  const startNodeAndAncestors = findNodeAtOffset(
    ast,
    start,
    opts,
    (node, parentNode) =>
      isSourceElement(opts, node, parentNode) && isSafeRangeRoot(node),
    [],
    "rangeStart",
    locFunctions,
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
          (node) => isSourceElement(opts, node) && isSafeRangeRoot(node),
          [],
          "rangeEnd",
          locFunctions,
        );
  if (!endNodeAndAncestors) {
    return;
  }

  let startNode;
  let endNode;
  if (ast.type === "JsonRoot") {
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

  const { locStart, locEnd } = locFunctions;
  return [
    Math.min(locStart(startNode), locStart(endNode)),
    Math.max(locEnd(startNode), locEnd(endNode)),
  ];
}

export { calculateRange };
