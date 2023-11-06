import { ParseSourceSpan } from "angular-html-parser";

/**
 * Find all connected blocks starting from a primary block.
 *
 * https://github.com/angular/angular/blob/327896606832bf6fbfc8f23989755123028136a8/packages/compiler/src/render3/r3_template_transform.ts#L396
 *
 * @param {number} primaryBlockIndex
 * @param {Array<any>} siblings
 * @param {(name:string) => boolean} predicate
 * @returns
 */
export function findConnectedBlocks(primaryBlockIndex, siblings, predicate) {
  const relatedBlocks = [siblings[primaryBlockIndex]];
  for (let i = primaryBlockIndex + 1; i < siblings.length; i++) {
    const node = siblings[i];
    if (node.type === "text" && node.value.trim().length === 0) {
      continue;
    }
    if (!(node.type === "block") || !predicate(node.name)) {
      break;
    }
    relatedBlocks.push(node);
  }
  return relatedBlocks;
}

export function createSourceSpanForBlocks(connectedBlocks) {
  const startLocation = connectedBlocks[0].sourceSpan.start;
  const endLocation = connectedBlocks.at(-1).sourceSpan.end;
  return new ParseSourceSpan(startLocation, endLocation);
}

/**
 * Replace children of node's parent from array-from to
 * transformed nested-form AST
 */
export function replaceChildrenByConnectedBlocks(connectedBlocks) {
  const [node] = connectedBlocks;
  const children = [];
  for (const child of node.parent.children) {
    if (child === node) {
      children.push(node);
      continue;
    }
    if (connectedBlocks.includes(child)) {
      continue;
    }
    children.push(child);
  }
  node.parent.children = children;
}
