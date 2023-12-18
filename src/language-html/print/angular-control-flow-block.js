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

  if (isPreviousBlockUnClosed(path)) {
    docs.push("} ");
  }

  docs.push("@", node.name);

  if (node.parameters) {
    docs.push(" (", group(print("parameters")), ")");
  }

  docs.push(" {");

  const shouldPrintCloseBracket = shouldCloseBlock(node);
  if (node.children.length > 0) {
    node.firstChild.hasLeadingSpaces = true;
    node.lastChild.hasTrailingSpaces = true;
    docs.push(indent([hardline, printChildren(path, options, print)]));
    if (shouldPrintCloseBracket) {
      docs.push(hardline, "}");
    }
  } else if (shouldPrintCloseBracket) {
    docs.push("}");
  }

  return group(docs, { shouldBreak: true });
}

function shouldCloseBlock(node) {
  return !(
    !hasPrettierIgnore(node) &&
    node.next?.type === "angularControlFlowBlock" &&
    ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS.get(node.name)?.has(node.next.name)
  );
}

function isPreviousBlockUnClosed(path) {
  const { previous } = path;
  return (
    previous?.type === "angularControlFlowBlock" &&
    !shouldCloseBlock(path.previous)
  );
}

function printAngularControlFlowBlockParameters(path, options, print) {
  return [
    indent([softline, join([";", line], path.map(print, "children"))]),
    softline,
  ];
}

export { printAngularControlFlowBlock, printAngularControlFlowBlockParameters };
