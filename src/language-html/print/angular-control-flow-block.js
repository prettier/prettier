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
    docs.push("} ");
  }

  docs.push("@", node.name);

  if (node.parameters) {
    docs.push(" (", group(print("parameters")), ")");
  }

  if (!isSwitchFallthroughCase(node)) {
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
  }

  return group(docs, { shouldBreak: true });
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

export { printAngularControlFlowBlock, printAngularControlFlowBlockParameters };
