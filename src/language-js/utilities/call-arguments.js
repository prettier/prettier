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
  | NodeMap["ImportType"]
  | NodeMap["ExternalModuleReference"]
} CallLikeNode
*/

import { getOrInsertComputed } from "../../utilities/get-or-insert.js";

const callArgumentsCache = new WeakMap();

/**
@param {CallLikeNode} node
*/
function getCallArgumentsWithoutCache(node) {
  let args;
  switch (node.type) {
    case "ImportExpression":
    case "TSImportType":
      args = [node.source];

      if (node.options) {
        args.push(node.options);
      }
      break;
    case "ImportType":
      args = [node.source];
      break;
    case "TSExternalModuleReference":
    case "ExternalModuleReference":
      args = [node.expression];
      break;
    default:
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

  switch (node.type) {
    case "ImportExpression":
    case "TSImportType":
      path.call(() => iteratee(path, 0), "source");

      if (node.options) {
        path.call(() => iteratee(path, 1), "options");
      }
      break;
    case "ImportType":
      path.call(() => iteratee(path, 0), "source");
      break;
    case "TSExternalModuleReference":
    case "ExternalModuleReference":
      path.call(() => iteratee(path, 0), "expression");
      break;
    default:
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
  }

  if (node.type === "ImportType") {
    if (index === 0 || index === -1) {
      return ["source"];
    }

    throw new RangeError("Invalid argument index");
  }

  if (
    node.type === "TSExternalModuleReference" ||
    node.type === "ExternalModuleReference"
  ) {
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
