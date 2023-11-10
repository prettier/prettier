import { group, hardline, indent, join } from "../../document/builders.js";
import { printChildren } from "./children.js";

let uid = 0;

const settings = new Map([
  [
    "if",
    {
      isFollowingBlock: false,
      followingBlocks: ["else if", "else"],
    },
  ],
  [
    "else if",
    {
      isFollowingBlock: true,
      followingBlocks: ["else if", "else"],
    },
  ],
  [
    "else",
    {
      isFollowingBlock: true,
      followingBlocks: [],
    },
  ],

  [
    "switch",
    {
      isFollowingBlock: false,
      followingBlocks: [],
    },
  ],
  [
    "case",
    {
      isFollowingBlock: false,
      followingBlocks: [],
    },
  ],
  [
    "default",
    {
      isFollowingBlock: false,
      followingBlocks: [],
    },
  ],

  [
    "for",
    {
      isFollowingBlock: false,
      followingBlocks: ["empty"],
    },
  ],
  [
    "empty",
    {
      isFollowingBlock: true,
      followingBlocks: [],
    },
  ],

  [
    "defer",
    {
      isFollowingBlock: false,
      followingBlocks: ["placeholder", "error", "loading"],
    },
  ],
  [
    "placeholder",
    {
      isFollowingBlock: true,
      followingBlocks: ["placeholder", "error", "loading"],
    },
  ],
  [
    "error",
    {
      isFollowingBlock: true,
      followingBlocks: ["placeholder", "error", "loading"],
    },
  ],
  [
    "loading",
    {
      isFollowingBlock: true,
      followingBlocks: ["placeholder", "error", "loading"],
    },
  ],
]);

function printAngularControlFlowBlock(path, options, print) {
  const { node } = path;
  const setting = settings.get(node.name);
  const docs = [];

  if (!setting) {
    throw new Error("Unknown block name: " + node.name);
  }

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
    names.length > 0 &&
    node.next?.type === "block" &&
    names.includes(node.next.name)
  );
}

export { printAngularControlFlowBlock };
