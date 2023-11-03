import throwSyntaxError from "../throw-syntax-error.js";
import {
  findConnectedBlocks,
  replaceChildrenByConnectedBlocks,
} from "./utils.js";

/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `defer` block.
 *
 * https://github.com/angular/angular/blob/master/packages/compiler/src/render3/r3_deferred_blocks.ts#L38
 */
export function isConnectedDeferLoopBlock(name) {
  return name === "placeholder" || name === "loading" || name === "error";
}

function validateDeferredBlocks(connectedBlocks) {
  const [, ...blocks] = connectedBlocks;
  let hasPlaceholder = false;
  let hasLoading = false;
  let hasError = false;
  for (const block of blocks) {
    switch (block.name) {
      case "placeholder":
        if (hasPlaceholder) {
          throwSyntaxError(
            block,
            "@defer block can only have one @placeholder block",
          );
        }
        hasPlaceholder = true;
        break;
      case "loading":
        if (hasLoading) {
          throwSyntaxError(
            block,
            "@defer block can only have one @loading block",
          );
        }
        hasLoading = true;
        break;
      case "error":
        if (hasError) {
          throwSyntaxError(
            block,
            "@defer block can only have one @error block",
          );
        }
        hasError = true;
        break;
      default:
        throwSyntaxError(block, `Unrecognized @defer block "${block.name}"`);
    }
  }
}

function transformDeferredConnectedBlocks(connectedBlocks) {
  const [primaryBlock, ...blocks] = connectedBlocks;
  const transformed = { ...primaryBlock, successorBlock: null };
  if (blocks.length > 0) {
    transformed.successorBlock = transformDeferredConnectedBlocks(blocks);
  }
  return transformed;
}

export function transformDeferredBlock(node) {
  const connectedBlocks = findConnectedBlocks(
    node.index,
    node.siblings,
    isConnectedDeferLoopBlock,
  );
  validateDeferredBlocks(connectedBlocks);
  const transformedDeferred = transformDeferredConnectedBlocks(connectedBlocks);
  replaceChildrenByConnectedBlocks(node, transformedDeferred, connectedBlocks);
}