import {
  group,
  hardline,
  softline,
  line,
  indent,
  join,
} from "../../document/builders.js";
import { printChildren } from "./children.js";
import {
  ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS,
  ANGULAR_CONTROL_FLOW_BLOCK_DEFAULT_SETTINGS,
} from "./angular-control-flow-block-settings.evaluate.js";

const unClosedBlocks = new WeakSet();

function printAngularControlFlowBlock(path, options, print) {
  const { node } = path;
  const setting =
    ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS.get(node.name) ??
    ANGULAR_CONTROL_FLOW_BLOCK_DEFAULT_SETTINGS;
  const docs = [];

  const previousBlock = findPreviousBlock(path);

  if (setting.isFollowingBlock && unClosedBlocks.has(previousBlock)) {
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

  if (!shouldPrintCloseBracket) {
    unClosedBlocks.add(node);
  }

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

function shouldCloseBlock(node, names) {
  return !(
    names.size > 0 &&
    node.next?.type === "block" &&
    names.has(node.next.name)
  );
}

function findPreviousBlock(path) {
  const { siblings, index } = path;

  for (let i = index - 1; i >= 0; i--) {
    const sibling = siblings[i];

    if (sibling.type === "block") {
      return sibling;
    }
  }
}

export { printAngularControlFlowBlock };
