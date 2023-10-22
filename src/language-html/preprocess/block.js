import { ParseSourceSpan } from "angular-html-parser";
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
  const transformed = {
    ...primaryBlock,
    successorBlock: null,
  };

  if (blocks.length > 0) {
    transformed.sourceSpan = new ParseSourceSpan(
      primaryBlock.startSourceSpan.start,
      blocks.at(-1).sourceSpan.end,
    );
    transformed.endSourceSpan = blocks.at(-1).endSourceSpan;
  }

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
  const children = [];
  for (const child of node.parent.children) {
    if (child === node) {
      children.push(transformedIfBlock);
      continue;
    }
    if (connectedBlocks.includes(child)) {
      continue;
    }
    children.push(child);
  }
  node.parent.children = children;
}

function transformForLoopConnectedBlocks(connectedBlocks) {
  const [primaryBlock, ...blocks] = connectedBlocks;
  const transformed = {
    ...primaryBlock,
    successorBlock: null,
  };
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
  const children = [];
  for (const child of node.parent.children) {
    if (child === node) {
      children.push(transformedForLoopBlock);
      continue;
    }
    if (connectedBlocks.includes(child)) {
      continue;
    }
    children.push(child);
  }
  node.parent.children = children;
}

function transformControlFlowBlockNode(ast) {
  ast.walk((node) => {
    if (node.type === "block") {
      switch (node.name) {
        case "if":
          transformIfBlock(node);
          break;
        case "defer":
          break;
        case "for":
          transoformForLoopBlock(node);
          break;
        case "switch":
          // Do nothing
          break;
        default:
          // TODO: throw error
          break;
      }
    }
  });
}

export { transformControlFlowBlockNode };
