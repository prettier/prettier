import { group, hardline, indent } from "../../document/builders.js";
import { printChildren } from "./children.js";

let uid = 0;

const settings = {
  if: {
    withExpression: true,
    isFollowingBlock: false,
    followingBlocks: ["else if", "else"],
  },
  "else if": {
    withExpression: true,
    isFollowingBlock: true,
    followingBlocks: ["else if", "else"],
  },
  else: {
    withExpression: false,
    isFollowingBlock: true,
    followingBlocks: [],
  },

  switch: {
    withExpression: true,
    isFollowingBlock: false,
    followingBlocks: [],
  },
  case: {
    withExpression: true,
    isFollowingBlock: false,
    followingBlocks: [],
  },
  default: {
    withExpression: false,
    isFollowingBlock: false,
    followingBlocks: [],
  },

  for: {
    withExpression: true,
    isFollowingBlock: false,
    followingBlocks: ["empty"],
  },
  empty: {
    withExpression: false,
    isFollowingBlock: true,
    followingBlocks: [],
  },

  defer: {
    withExpression: true,
    isFollowingBlock: false,
    followingBlocks: ["placeholder", "error", "loading"],
  },
  placeholder: {
    withExpression: false,
    isFollowingBlock: true,
    followingBlocks: ["placeholder", "error", "loading"],
  },
  error: {
    withExpression: false,
    isFollowingBlock: true,
    followingBlocks: ["placeholder", "error", "loading"],
  },
  loading: {
    withExpression: true,
    isFollowingBlock: true,
    followingBlocks: ["placeholder", "error", "loading"],
  },
};

function printBlock(path, options, print) {
  const { node } = path;

  const setting = settings[node.name];
  const contents = [];

  if (!setting) {
    throw new Error("Unknown block name: " + node.name);
  }

  if (
    setting.isFollowingBlock &&
    path.previous &&
    path.previous.type === "block"
  ) {
    contents.push("} ");
  }

  contents.push(`@${node.name}`);

  if (setting.withExpression) {
    const expression = fetchExpression(node);
    contents.push(` (${expression})`);
  }

  contents.push(" {");

  const children = printChildren(path, options, print);
  contents.push(indent([hardline, children]));

  if (shouldCloseBlock(node, setting.followingBlocks)) {
    contents.push(hardline, "}");
  }

  return group(contents, {
    id: Symbol("block-" + ++uid),
    shouldBreak: true,
  });
}

export { printBlock };

function shouldCloseBlock(node, names) {
  return names.length === 0 || !node.next || !names.includes(node.next.name);
}

function fetchExpression(node) {
  return node.parameters
    .filter((parameter) => parameter.type === "blockParameter")
    .map((parameter) => parameter.expression)
    .join("; ");
}
