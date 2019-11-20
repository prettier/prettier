"use strict";

const { getLast } = require("../common/util");

function postprocess(ast, options) {
  visitNode(ast, node => {
    switch (node.type) {
      // fix unexpected locEnd caused by --no-semi style
      case "VariableDeclaration": {
        const lastDeclaration = getLast(node.declarations);
        if (lastDeclaration && lastDeclaration.init) {
          overrideLocEnd(node, lastDeclaration);
        }
        break;
      }
      // remove redundant TypeScript nodes
      case "TSParenthesizedType": {
        return node.typeAnnotation;
      }
      case "TSUnionType":
      case "TSIntersectionType":
        if (node.types.length === 1) {
          // override loc, so that comments are attached properly
          return Object.assign({}, node.types[0], {
            loc: node.loc,
            range: node.range
          });
        }
        break;
      case "EnumDeclaration":
        // A workaround for what looks like a bug in Flow.
        // Flow assigns the same range to enum nodes and enum body nodes.
        if (
          options.parser === "flow" &&
          node.body.range[0] === node.range[0] &&
          node.body.range[1] === node.range[1]
        ) {
          node.body.range = [node.id.range[1], node.range[1] - 1];
        }
        // Babel does strange things as well. E.g. node.body.start > node.body.end can be true.
        if (options.parser === "babel-flow") {
          node.body.start = node.id.end;
          node.body.end = node.end - 1;
        }
        break;
    }
  });

  return ast;

  /**
   * - `toOverrideNode` must be the last thing in `toBeOverriddenNode`
   * - do nothing if there's a semicolon on `toOverrideNode.end` (no need to fix)
   */
  function overrideLocEnd(toBeOverriddenNode, toOverrideNode) {
    if (options.originalText[locEnd(toOverrideNode)] === ";") {
      return;
    }
    if (options.parser === "flow") {
      toBeOverriddenNode.range = [
        toBeOverriddenNode.range[0],
        toOverrideNode.range[1]
      ];
    } else {
      toBeOverriddenNode.end = toOverrideNode.end;
    }
    toBeOverriddenNode.loc = Object.assign({}, toBeOverriddenNode.loc, {
      end: toBeOverriddenNode.loc.end
    });
  }

  function locEnd(node) {
    return options.parser === "flow" ? node.range[1] : node.end;
  }
}

function visitNode(node, fn, parent, property) {
  if (!node || typeof node !== "object") {
    return;
  }

  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      visitNode(node[i], fn, node, i);
    }
    return;
  }

  if (typeof node.type !== "string") {
    return;
  }

  for (const key of Object.keys(node)) {
    visitNode(node[key], fn, node, key);
  }

  const replacement = fn(node);

  if (replacement) {
    parent[property] = replacement;
  }
}

module.exports = postprocess;
