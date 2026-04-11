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

  const keepInline = isTextOnlyInlineBlock(node, options);

  if (isPreviousBlockUnClosed(path)) {
    if (previousBlockSelfClosed(path, options)) {
      // Previous block already closed its }, just add a space before @
      // for readability (safe since } and @ are template syntax, not content).
      if (!node.hasLeadingSpaces) {
        docs.push(" ");
      }
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

  return keepInline ? group(docs) : group(docs, { shouldBreak: true });
}

/**
 * Check if a block should keep its body on a single line.
 *
 * True when all children are text/interpolation — with Angular's
 * preserveWhitespaces: false (the default), whitespace around elements
 * inside { } is stripped, so breaking is safe for element content.
 * But for text-only content, adding line breaks would introduce
 * visible whitespace.
 *
 * Returns false when:
 * - htmlWhitespaceSensitivity is "ignore" (whitespace doesn't matter)
 * - The original had line breaks inside { } (developer intent)
 * - The block contains HTML elements (Angular strips whitespace)
 * - The block has no children
 */
function isTextOnlyInlineBlock(node, options) {
  if (
    options.htmlWhitespaceSensitivity === "ignore" ||
    node.children.length === 0
  ) {
    return false;
  }
  const hasInternalLineBreak =
    node.firstChild.hasLeadingSpaces &&
    node.startSourceSpan.end.line < node.firstChild.sourceSpan.start.line;
  return (
    !hasInternalLineBreak &&
    node.children.every(
      (child) => child.kind === "text" || child.kind === "interpolation",
    )
  );
}

/**
 * Check if the previous block in a chain already closed its own bracket
 * during printing (which happens when it kept its body inline).
 * e.g. in `<span>@if (cond) {text} @else {other}</span>`, the @if block
 * self-closes its `}`, so @else should not print `} ` again.
 */
function previousBlockSelfClosed(path, options) {
  return path.previous ? isTextOnlyInlineBlock(path.previous, options) : false;
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
 */
function isAdjacentAngularControlFlowBlockAndText(firstNode, secondNode) {
  if (secondNode.hasLeadingSpaces) {
    return false;
  }
  const isInlineContent = (node) =>
    node.kind === "text" || node.kind === "interpolation";
  return (
    (firstNode.kind === "angularControlFlowBlock" &&
      isInlineContent(secondNode)) ||
    (secondNode.kind === "angularControlFlowBlock" &&
      isInlineContent(firstNode))
  );
}

export {
  isAdjacentAngularControlFlowBlockAndText,
  printAngularControlFlowBlock,
  printAngularControlFlowBlockParameters,
};
