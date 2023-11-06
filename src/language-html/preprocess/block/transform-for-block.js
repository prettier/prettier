import throwSyntaxError from "../throw-syntax-error.js";
import {
  findConnectedBlocks,
  replaceChildrenByConnectedBlocks,
} from "./utils.js";

/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `for` block.
 *
 * https://github.com/angular/angular/blob/master/packages/compiler/src/render3/r3_control_flow.ts#L39
 */
function isConnectedForLoopBlock(name) {
  return name === "empty";
}

function transformForLoopConnectedBlocks(connectedBlocks) {
  const [primaryBlock, ...blocks] = connectedBlocks;
  primaryBlock.successorBlock = null;
  for (const block of blocks) {
    if (block.name === "empty") {
      if (primaryBlock.successorBlock !== null) {
        throwSyntaxError(block, "@for loop can only have one @empty block");
      } else if (block.parameters.length > 0) {
        throwSyntaxError(block, "@empty block cannot have parameters");
      } else {
        primaryBlock.successorBlock = block;
      }
    }
  }
}

export function transformForLoopBlock(node) {
  const connectedBlocks = findConnectedBlocks(
    node.index,
    node.siblings,
    isConnectedForLoopBlock,
  );
  transformForLoopConnectedBlocks(connectedBlocks);
  replaceChildrenByConnectedBlocks(connectedBlocks);
}
