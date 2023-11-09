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
  const node = path.node;

  const setting = settings[node.name];
  let contents = [];

  if (!setting) {
    throw new Error("Unknown block name: " + node.name);
  }

  if (setting.isFollowingBlock) {
    contents.push(`} `);
  }

  contents.push(`@${node.name}`);

  if (setting.withExpression) {
    let expression = fetchExpression(node);
    contents.push(` (${expression})`);
  }

  contents.push(` {`);

  let children = printChildren(path, options, print);
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
  return names.length == 0 || !node.next || !names.includes(node.next.name);
}

function fetchExpression(node) {
  return node.parameters
    .filter((parameter) => parameter.type === "blockParameter")
    .map((parameter) => parameter.expression)
    .join("; ");
}
