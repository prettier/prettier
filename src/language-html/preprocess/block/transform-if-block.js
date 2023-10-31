import { ELSE_IF_PATTERN } from "../../utils/else-if-pattern.js";
import {
  findConnectedBlocks,
  replaceChildrenByConnectedBlocks,
  createSourceSpanForBlocks,
} from "./utils.js";

/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to an `if` block.
 *
 * https://github.com/angular/angular/blob/327896606832bf6fbfc8f23989755123028136a8/packages/compiler/src/render3/r3_control_flow.ts#L47
 *
 * @param {string} name
 * @returns {boolean}
 */
function isConnectedIfLoopBlock(name) {
  return name === "else" || ELSE_IF_PATTERN.test(name);
}

/**
 * Transform a list of connected blocks into an nested `if` block.
 *
 * @param {Array<any>} connectedBlocks
 * @returns {any}
 */
function transformIfConnectedBlocks(connectedBlocks) {
  if (connectedBlocks.length === 0) {
    return null;
  }
  const [primaryBlock, ...blocks] = connectedBlocks;
  const transformed = { ...primaryBlock, successorBlock: null };
  if (blocks.length > 0) {
    transformed.successorBlock = transformIfConnectedBlocks(blocks);
  }
  return transformed;
}

export function transformIfBlock(node) {
  const connectedBlocks = findConnectedBlocks(
    node.index,
    node.siblings,
    isConnectedIfLoopBlock,
  );
  const transformedIfBlock = transformIfConnectedBlocks(connectedBlocks);
  replaceChildrenByConnectedBlocks(node, transformedIfBlock, connectedBlocks);

  transformedIfBlock.sourceSpan = createSourceSpanForBlocks(connectedBlocks);
}
