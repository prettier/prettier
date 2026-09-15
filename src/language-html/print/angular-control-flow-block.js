import {
  group,
  hardline,
  indent,
  join,
  line,
  replaceEndOfLine,
  softline,
} from "../../document/index.js";
import { locEnd, locStart } from "../loc.js";
import { hasPrettierIgnore } from "../utilities/index.js";
import { isInNgNonBindable } from "../utilities/is-in-ng-non-bindable.js";
import { ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS } from "./angular-control-flow-block-settings.evaluate.js";
import { printChildren } from "./children.js";
import { printClosingTagSuffix, printOpeningTagPrefix } from "./tag.js";

function printAngularControlFlowBlock(path, options, print) {
  const { node } = path;

  if (isInNgNonBindable(path, options)) {
    return printNgNonBindableControlFlowBlock(path, options, print);
  }

  const docs = [];

  if (isPreviousBlockUnClosed(path)) {
    docs.push("} ");
  }

  docs.push("@", node.name);

  const isDefaultNever = isSwitchExhaustiveCheck(node);

  if (node.parameters) {
    // No space in `@default never(state)`
    // https://github.com/prettier/prettier/issues/19570#issuecomment-4916194365
    if (!isDefaultNever) {
      docs.push(" ");
    }

    docs.push("(", group(print("parameters")), ")");
  }

  if (isDefaultNever) {
    docs.push(";");
    return docs;
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

function printNgNonBindableControlFlowBlock(path, options, print) {
  const { node } = path;
  const endOffset = node.endSourceSpan?.start.offset ?? locEnd(node);
  const parts = [
    printOpeningTagPrefix(node, options),
    replaceEndOfLine(node.startSourceSpan.toString()),
  ];

  if (node.children.length === 0) {
    parts.push(
      replaceEndOfLine(
        options.originalText.slice(node.startSourceSpan.end.offset, endOffset),
      ),
    );
  } else {
    node.firstChild.hasLeadingSpaces = true;
    node.lastChild.hasTrailingSpaces = true;

    parts.push(
      replaceEndOfLine(
        options.originalText.slice(
          node.startSourceSpan.end.offset,
          locStart(node.firstChild),
        ),
      ),
      printChildren(path, options, print),
      replaceEndOfLine(
        options.originalText.slice(locEnd(node.lastChild), endOffset),
      ),
    );
  }

  if (node.endSourceSpan) {
    parts.push(replaceEndOfLine(node.endSourceSpan.toString()));
  }

  parts.push(printClosingTagSuffix(node, options));

  return parts;
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

export { printAngularControlFlowBlock, printAngularControlFlowBlockParameters };
