import { ELSE_IF_PATTERN } from "../utils/else-if-pattern.js";
import throwSyntaxError from "./throw-syntax-error.js";

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
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `for` block.
 *
 * https://github.com/angular/angular/blob/master/packages/compiler/src/render3/r3_control_flow.ts#L39
 */
function isConnectedForLoopBlock(name) {
  return name === "empty";
}

/**
 * Predicate function that determines if a block with
 * a specific name cam be connected to a `defer` block.
 *
 * https://github.com/angular/angular/blob/master/packages/compiler/src/render3/r3_deferred_blocks.ts#L38
 */
export function isConnectedDeferLoopBlock(name) {
  return name === "placeholder" || name === "loading" || name === "error";
}

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
function findConnectedBlocks(primaryBlockIndex, siblings, predicate) {
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

function replaceChildrenByConnectedBlocks(node, replacement, connectedBlocks) {
  const children = [];
  for (const child of node.parent.children) {
    if (child === node) {
      children.push(replacement);
      continue;
    }
    if (connectedBlocks.includes(child)) {
      continue;
    }
    children.push(child);
  }
  node.parent.children = children;
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

function transformIfBlock(node) {
  const connectedBlocks = findConnectedBlocks(
    node.index,
    node.siblings,
    isConnectedIfLoopBlock,
  );
  const transformedIfBlock = transformIfConnectedBlocks(connectedBlocks);
  replaceChildrenByConnectedBlocks(node, transformedIfBlock, connectedBlocks);
}

function transformForLoopConnectedBlocks(connectedBlocks) {
  const [primaryBlock, ...blocks] = connectedBlocks;
  const transformed = { ...primaryBlock, successorBlock: null };
  for (const block of blocks) {
    if (block.name === "empty") {
      if (transformed.successorBlock !== null) {
        throwSyntaxError(block, "@for loop can only have one @empty block");
      } else if (block.parameters.length > 0) {
        throwSyntaxError(block, "@empty block cannot have parameters");
      } else {
        transformed.successorBlock = block;
      }
    } else {
      throwSyntaxError(block, `Unrecognized @for loop block "${block.name}"`);
    }
  }
  return transformed;
}

function transoformForLoopBlock(node) {
  const connectedBlocks = findConnectedBlocks(
    node.index,
    node.siblings,
    isConnectedForLoopBlock,
  );
  const transformedForLoopBlock =
    transformForLoopConnectedBlocks(connectedBlocks);
  replaceChildrenByConnectedBlocks(
    node,
    transformedForLoopBlock,
    connectedBlocks,
  );
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

function transformDeferredBlock(node) {
  const connectedBlocks = findConnectedBlocks(
    node.index,
    node.siblings,
    isConnectedDeferLoopBlock,
  );
  validateDeferredBlocks(connectedBlocks);
  const transformedDeferred = transformDeferredConnectedBlocks(connectedBlocks);
  replaceChildrenByConnectedBlocks(node, transformedDeferred, connectedBlocks);
}

function transformControlFlowBlockNode(ast) {
  ast.walk((node) => {
    if (node.type === "block") {
      switch (node.name) {
        case "if":
          transformIfBlock(node);
          break;
        case "defer":
          transformDeferredBlock(node);
          break;
        case "for":
          transoformForLoopBlock(node);
          break;
        case "switch":
          // Do nothing
          break;
        default:
          break;
      }
    }
  });
}

export { transformControlFlowBlockNode };
