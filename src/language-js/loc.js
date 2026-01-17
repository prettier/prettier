/**
@import {Node} from "./types/estree.js";
*/

const isIndex = (value) => Number.isInteger(value) && value >= 0;

function locStart(node) {
  const start = node.range?.[0] ?? node.start;

  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production" && !isIndex(start)) {
    throw new TypeError("Can't not locate node.");
  }

  // Handle nodes with decorators. They should start at the first decorator
  const firstDecorator = (node.declaration?.decorators ?? node.decorators)?.[0];
  if (firstDecorator) {
    return Math.min(locStart(firstDecorator), start);
  }

  return start;
}

function locEnd(node) {
  if (node.type === "BreakStatement" || node.type === "ContinueStatement") {
    const start = locStart(node);
    return node.label
      ? locEnd(node.label)
      : start +
          (node.type === "BreakStatement" ? "break".length : "continue".length);
  }

  if (node.type === "VariableDeclaration") {
    const lastDeclaration = node.declarations.at(-1);
    return locEnd(lastDeclaration);
  }

  const end = node.range?.[1] ?? node.end;

  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production" && !isIndex(end)) {
    throw new TypeError("Can't not locate node.");
  }

  return end;
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocStart(nodeA, nodeB) {
  const nodeAStart = locStart(nodeA);
  return isIndex(nodeAStart) && nodeAStart === locStart(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLocEnd(nodeA, nodeB) {
  const nodeAEnd = locEnd(nodeA);
  return isIndex(nodeAEnd) && nodeAEnd === locEnd(nodeB);
}

/**
 * @param {Node} nodeA
 * @param {Node} nodeB
 * @returns {boolean}
 */
function hasSameLoc(nodeA, nodeB) {
  return hasSameLocStart(nodeA, nodeB) && hasSameLocEnd(nodeA, nodeB);
}

export { hasSameLoc, hasSameLocStart, locEnd, locStart };
