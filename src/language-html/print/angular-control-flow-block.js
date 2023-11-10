import { group, hardline, indent, join } from "../../document/builders.js";
import { printChildren } from "./children.js";
import settings from "./angular-control-flow-block-settings.evaluate.js";

let uid = 0;

function printAngularControlFlowBlock(path, options, print) {
  const { node } = path;
  const setting =
    settings.ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS.get(node.name) ??
    settings.DEFAULT_ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS;
  const docs = [];

  if (
    setting.isFollowingBlock &&
    path.previous &&
    path.previous.type === "block"
  ) {
    docs.push("} ");
  }

  docs.push("@", node.name);

  if (node.parameters.length > 0) {
    const parametersDoc =
      node.__embed_parameters_doc ??
      group(join("; ", path.map(print, "parameters")));

    docs.push(" (", parametersDoc, ")");
  }

  docs.push(" {");

  const children = printChildren(path, options, print);
  docs.push(indent([hardline, children]));

  if (shouldCloseBlock(node, setting.followingBlocks)) {
    docs.push(hardline, "}");
  }

  return group(docs, {
    id: Symbol("block-" + ++uid),
    shouldBreak: true,
  });
}

function shouldCloseBlock(node, names) {
  return !(
    names.size > 0 &&
    node.next?.type === "block" &&
    names.has(node.next.name)
  );
}

export { printAngularControlFlowBlock };
