import {
  group,
  hardline,
  indent,
  join,
  line,
  softline,
} from "../../document/builders.js";
import { hasPrettierIgnore } from "../utils/index.js";
import ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS from "./angular-control-flow-block-settings.evaluate.js";
import { printChildren } from "./children.js";

function printAngularControlFlowBlock(path, options, print) {
  const { node } = path;
  const docs = [];

  if (isPreviousBlockUnClosed(path, options)) {
    docs.push("} ");
  }

  docs.push("@", node.name);

  if (node.parameters) {
    docs.push(" (", group(print("parameters")), ")");
  }

  docs.push(" {");

  const shouldPrintCloseBracket = shouldCloseBlock(node, options);
  if (node.children.length > 0) {
    node.firstChild.hasLeadingSpaces = true;
    node.lastChild.hasTrailingSpaces = true;
    docs.push(
      indent([
        shouldBreakLineWithinBrackets(node, options, "open") ? hardline : "",
        printChildren(path, options, print),
      ]),
    );
    if (shouldPrintCloseBracket) {
      docs.push(
        shouldBreakLineWithinBrackets(node, options, "close") ? hardline : "",
        "}",
      );
    }
  } else if (shouldPrintCloseBracket) {
    docs.push("}");
  }

  return group(docs, { shouldBreak: true });
}

function shouldCloseBlock(node, options) {
  if (shouldBreakLineWithinBrackets(node, options, "close") === false) {
    return true;
  }
  if (
    node.next?.type !== "angularControlFlowBlock" ||
    !ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS.get(node.name)?.has(node.next.name)
  ) {
    return true;
  }
  return false;
}

function isPreviousBlockUnClosed(path, options) {
  const { previous } = path;
  return (
    previous?.type === "angularControlFlowBlock" &&
    !hasPrettierIgnore(previous) &&
    !shouldCloseBlock(previous, options)
  );
}

function printAngularControlFlowBlockParameters(path, options, print) {
  return [
    indent([softline, join([";", line], path.map(print, "children"))]),
    softline,
  ];
}

function lineStart(node) {
  return node.sourceSpan.start.line;
}

function lineEnd(node) {
  return node.sourceSpan.end.line;
}

function isWhitespaceSensitiveNodeInBlock(node) {
  return node.type === "text" || node.type === "interpolation";
}

/**
 * Returns whether to print a hardline inside the brackets of a control flow block.
 *
 * The inside of Angular control flow blocks is space-sensitive,
 * meaning the following two pieces of code produce different outputs:
 *
 * 1:
 *   @if (true) {foo}
 *
 * 2:
 *   @if (true) {
 *     foo
 *   }
 *
 * So, when the --html-whitespace-sensitivity option is not set to `ignore`,
 * we should control line breaks to ensure consistent rendering.
 * For more details, please read https://github.com/prettier/prettier/issues/16577.
 *
 * @param {any} block
 * @param {any} options
 * @param {"open" | "close"} kind
 * @returns {boolean}
 */
function shouldBreakLineWithinBrackets(block, options, kind) {
  if (options.htmlWhitespaceSensitivity === "ignore") {
    return true;
  }
  const child = kind === "open" ? block.firstChild : block.lastChild;
  if (!child || !isWhitespaceSensitiveNodeInBlock(child)) {
    return true;
  }
  const lineFn = kind === "open" ? lineStart : lineEnd;
  if (!child || lineFn(block) !== lineFn(child)) {
    return true;
  }
  return false;
}

export { printAngularControlFlowBlock, printAngularControlFlowBlockParameters };
