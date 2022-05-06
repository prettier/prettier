"use strict";

// Copied from https://github.com/sindresorhus/eslint-plugin-unicorn/blob/d53d935951aa815c763fc9441aa452c763294715/rules/utils/is-node-matches.js

/**
 * @typedef {import("../types/estree").Node} Node
 */

/**
Check if node matches object name or key path.

@param {Node} node - The AST node to check.
@param {string} nameOrPath - The object name or key path.
@returns {boolean}
*/
function isNodeMatchesNameOrPath(node, nameOrPath) {
  const names = nameOrPath.split(".");
  for (let index = names.length - 1; index >= 0; index--) {
    const name = names[index];

    if (index === 0) {
      return node.type === "Identifier" && node.name === name;
    }

    if (
      node.type !== "MemberExpression" ||
      node.optional ||
      node.computed ||
      node.property.type !== "Identifier" ||
      node.property.name !== name
    ) {
      return false;
    }

    node = node.object;
  }
}

/**
Check if node matches any object name or key path.

@param {Node} node - The AST node to check.
@param {string[]} nameOrPaths - The object name or key paths.
@returns {boolean}
*/
function isNodeMatches(node, nameOrPaths) {
  return nameOrPaths.some((nameOrPath) =>
    isNodeMatchesNameOrPath(node, nameOrPath)
  );
}

module.exports = isNodeMatches;
