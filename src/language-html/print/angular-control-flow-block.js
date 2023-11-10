import {
  group,
  hardline,
  softline,
  line,
  indent,
  join,
} from "../../document/builders.js";
import { printChildren } from "./children.js";
import settings from "./angular-control-flow-block-settings.evaluate.js";

function printAngularControlFlowBlock(path, options, print) {
  const { node } = path;
  const setting =
    settings.ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS.get(node.name) ??
    settings.DEFAULT_ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS;
  const docs = [];

  const prevBlock = findPreviousBlock(path);

  if (setting.isFollowingBlock && !prevBlock.__control_flow_block_closed) {
    docs.push("} ");
  }

  docs.push("@", node.name);

  if (node.parameters.length > 0) {
    const parametersDoc = group(
      node.__embed_parameters_doc ?? [
        indent([softline, join([";", line], path.map(print, "parameters"))]),
        softline,
      ],
    );

    docs.push(" (", parametersDoc, ")");
  }

  docs.push(" {");
  const shouldPrintCloseBracket = shouldCloseBlock(
    node,
    setting.followingBlocks,
  );

  if (node.children.length > 0) {
    docs.push(indent([hardline, printChildren(path, options, print)]));
    if (shouldPrintCloseBracket) {
      docs.push(hardline, "}");
    }
  } else if (shouldPrintCloseBracket) {
    docs.push("}");
  }

  node.__control_flow_block_closed = shouldPrintCloseBracket;

  return group(docs, { shouldBreak: true });
}

function shouldCloseBlock(node, names) {
  return !(
    names.size > 0 &&
    node.next?.type === "block" &&
    names.has(node.next.name)
  );
}

function findPreviousBlock(path) {
  const siblings = path.siblings;
  const node = path.node;
  const index = siblings.indexOf(node);

  for (let i = index - 1; i >= 0; i--) {
    const sibling = siblings[i];

    if (sibling.type === "block") {
      return sibling;
    }
  }
}

export { printAngularControlFlowBlock };
