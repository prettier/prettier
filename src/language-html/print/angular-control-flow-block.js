import {
  group,
  hardline,
  indent,
  join,
  line,
  softline,
} from "../../document/index.js";
import { hasPrettierIgnore } from "../utilities/index.js";
import ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS from "./angular-control-flow-block-settings.evaluate.js";
import { printChildren } from "./children.js";

function printAngularControlFlowBlock(path, options, print) {
  const { node } = path;
  const docs = [];

  if (isPreviousBlockUnClosed(path)) {
    if (previousBlockSelfClosed(path, options)) {
      // Previous block already closed its }, add space for readability.
      // Always add since the between-line separator is suppressed for chains.
      docs.push(" ");
    } else {
      docs.push("} ");
    }
  }

  docs.push("@", node.name);

  if (isSwitchExhaustiveCheck(node)) {
    docs.push(";");
    return docs;
  }

  if (node.parameters) {
    docs.push(" (", group(print("parameters")), ")");
  }

  // Keep the block body inline when all children are text/interpolation.
  // With Angular's preserveWhitespaces: false (the default), whitespace
  // around elements inside { } is stripped, so breaking is safe for
  // element content. But for text-only content, adding line breaks
  // introduces visible whitespace.
  const hasLeadingWhitespace =
    node.children.length > 0 && node.firstChild.hasLeadingSpaces;
  const keepInline =
    options.htmlWhitespaceSensitivity !== "ignore" &&
    !hasLeadingWhitespace &&
    node.children.length > 0 &&
    node.children.every(
      (child) => child.kind === "text" || child.kind === "interpolation",
    );

  if (!isSwitchFallthroughCase(node)) {
    docs.push(" {");

    if (node.children.length > 0) {
      if (keepInline) {
        const leadingSpace = node.firstChild.hasLeadingSpaces ? " " : "";
        const trailingSpace = node.lastChild.hasTrailingSpaces ? " " : "";
        docs.push(
          leadingSpace,
          printChildren(path, options, print),
          trailingSpace,
          "}",
        );
      } else {
        node.firstChild.hasLeadingSpaces = true;
        node.lastChild.hasTrailingSpaces = true;
        docs.push(indent([hardline, printChildren(path, options, print)]));
        if (shouldCloseBlock(node)) {
          docs.push(hardline, "}");
        }
      }
    } else if (shouldCloseBlock(node)) {
      docs.push("}");
    }
  }

  return group(docs, { shouldBreak: true });
}

/**
 * Check if the previous block in a chain already closed its own bracket
 * during printing (which happens when it kept its body inline).
 */
function previousBlockSelfClosed(path, options) {
  const prev = path.previous;
  if (
    !prev ||
    options.htmlWhitespaceSensitivity === "ignore" ||
    prev.children.length === 0
  ) {
    return false;
  }
  return (
    !prev.firstChild.hasLeadingSpaces &&
    prev.children.every(
      (child) => child.kind === "text" || child.kind === "interpolation",
    )
  );
}

function shouldCloseBlock(node) {
  return !(
    node.next?.kind === "angularControlFlowBlock" &&
    ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS.get(node.name)?.has(node.next.name)
  );
}

const isSwitchCaseBlock = (node) =>
  node?.kind === "angularControlFlowBlock" &&
  (node.name === "case" || node.name === "default");

const isSwitchExhaustiveCheck = (node) =>
  node?.kind === "angularControlFlowBlock" && node.name === "default never";

// https://github.com/angular/angular/commit/0ad3adc7c6d4094f1e3432a3f2e3bdc9862cb4fa#diff-77a6f285c6ea13d6644ef635e7495e71134d1141af2650cb9ae5631ff1f38bf2R263
// https://github.com/prettier/prettier/issues/18563#issuecomment-3728354491
function isSwitchFallthroughCase(node) {
  return (
    isSwitchCaseBlock(node) &&
    node.endSourceSpan &&
    node.endSourceSpan.start.offset === node.endSourceSpan.end.offset
  );
}

function isPreviousBlockUnClosed(path) {
  const { previous } = path;
  return (
    previous?.kind === "angularControlFlowBlock" &&
    !hasPrettierIgnore(previous) &&
    !shouldCloseBlock(previous)
  );
}

function printAngularControlFlowBlockParameters(path, options, print) {
  return [
    indent([softline, join([";", line], path.map(print, "children"))]),
    softline,
  ];
}

/**
 * Check if a break between two nodes (in document order) should be
 * suppressed because it would introduce whitespace between a control
 * flow block and adjacent text/interpolation that had no original space.
 * Also suppresses breaks between chained blocks (e.g. @if/@else) when
 * the first block self-closed with text-only content.
 */
function isAdjacentAngularControlFlowBlockAndText(firstNode, secondNode) {
  const isInlineContent = (node) =>
    node.kind === "text" || node.kind === "interpolation";
  const isCfBlock = (node) => node.kind === "angularControlFlowBlock";

  // Suppress breaks between chained blocks when the first self-closed
  // (text-only, no internal whitespace). The space is handled by the
  // block printer. Switch fallthroughs are excluded (not in settings).
  if (
    isCfBlock(firstNode) &&
    isCfBlock(secondNode) &&
    firstNode.children.length > 0 &&
    !firstNode.firstChild.hasLeadingSpaces &&
    !firstNode.lastChild.hasTrailingSpaces &&
    firstNode.children.every(isInlineContent) &&
    ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS.get(firstNode.name)?.has(
      secondNode.name,
    )
  ) {
    return true;
  }

  if (secondNode.hasLeadingSpaces) {
    return false;
  }
  return (
    (isCfBlock(firstNode) && isInlineContent(secondNode)) ||
    (isCfBlock(secondNode) && isInlineContent(firstNode))
  );
}

export {
  isAdjacentAngularControlFlowBlockAndText,
  printAngularControlFlowBlock,
  printAngularControlFlowBlockParameters,
};
