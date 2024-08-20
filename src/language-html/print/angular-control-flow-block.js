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
    const strictWhitespaces = options.htmlWhitespaceSensitivity !== "ignore";

    node.firstChild.hasLeadingSpaces = true;
    node.lastChild.hasTrailingSpaces = true;

    docs.push(
      indent([
        linebreakAfterOpenBracket(node, options),
        printChildren(path, options, print),
      ]),
    );
    if (shouldPrintCloseBracket) {
      docs.push(linebreakBeforeCloseBracket(node, options), "}");
    }
  } else if (shouldPrintCloseBracket) {
    docs.push("}");
  }

  return group(docs, { shouldBreak: true });
}

function shouldCloseBlock(node, options) {
  if (linebreakBeforeCloseBracket(node, options) === "") {
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

function linebreakAfterOpenBracket(block, options) {
  if (options.htmlWhitespaceSensitivity === "ignore") {
    return hardline;
  }
  if (!isWhitespaceSensitiveNodeInBlock(block.firstChild)) {
    return hardline;
  }
  const blockStart = lineStart(block);
  const firstChildStart = lineStart(block.firstChild);
  if (blockStart !== firstChildStart) {
    return hardline;
  }
  return "";
}

function linebreakBeforeCloseBracket(block, options) {
  if (options.htmlWhitespaceSensitivity === "ignore") {
    return hardline;
  }
  if (!isWhitespaceSensitiveNodeInBlock(block.lastChild)) {
    return hardline;
  }
  const blockEnd = lineEnd(block);
  const lastChildEnd = lineEnd(block.lastChild);
  if (blockEnd !== lastChildEnd) {
    return hardline;
  }
  return "";
}

function isWhitespaceSensitiveNodeInBlock(node) {
  return node.type === "text" || node.type === "interpolation";
}

export { printAngularControlFlowBlock, printAngularControlFlowBlockParameters };
