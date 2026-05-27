/**
@import {
  Node,
  NodeMap,
} from "../types/estree.js";
@typedef {
  | NodeMap["NewExpression"]
  | NodeMap["ImportExpression"]
  | NodeMap["OptionalCallExpression"]
  | NodeMap["CallExpression"]
  | NodeMap["TSImportType"]
  | NodeMap["TSExternalModuleReference"]
} CallLikeNode
*/

import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

const callArgumentsCache = new WeakMap();

/**
@param {CallLikeNode} node
*/
function getCallArgumentsWithoutCache(node) {
  let args;
  if (node.type === "ImportExpression" || node.type === "TSImportType") {
    args = [node.source];

    if (node.options) {
      args.push(node.options);
    }
  } else if (node.type === "TSExternalModuleReference") {
    args = [node.expression];
  } else {
    args = node.arguments;
  }

  return args;
}

/**
@param {CallLikeNode} node
*/
function getCallArguments(node) {
  return getOrInsertComputed(
    callArgumentsCache,
    node,
    getCallArgumentsWithoutCache,
  );
}

function iterateCallArgumentsPath(path, iteratee) {
  const { node } = path;

  if (node.type === "ImportExpression" || node.type === "TSImportType") {
    path.call(() => iteratee(path, 0), "source");

    if (node.options) {
      path.call(() => iteratee(path, 1), "options");
    }
  } else if (node.type === "TSExternalModuleReference") {
    path.call(() => iteratee(path, 0), "expression");
  } else {
    path.each(iteratee, "arguments");
  }
}

/**
@param {CallLikeNode} node
@param {number} index
*/
function getCallArgumentSelector(node, index) {
  if (node.type === "ImportExpression" || node.type === "TSImportType") {
    if (index === 0 || index === (node.options ? -2 : -1)) {
      return ["source"];
    }
    if (node.options && (index === 1 || index === -1)) {
      return ["options"];
    }
    throw new RangeError("Invalid argument index");
  } else if (node.type === "TSExternalModuleReference") {
    if (index === 0 || index === -1) {
      return ["expression"];
    }
  } else {
    if (index < 0) {
      index = node.arguments.length + index;
    }
    if (index >= 0 && index < node.arguments.length) {
      return ["arguments", index];
    }
  }

  /* c8 ignore next */
  throw new RangeError("Invalid argument index");
}

export { getCallArguments, getCallArgumentSelector, iterateCallArgumentsPath };
