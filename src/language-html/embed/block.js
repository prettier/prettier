import { group, hardline, indent, softline } from "../../document/builders.js";
import { printChildren } from "../print/children.js";
import {
  formatAttributeValue,
  printExpand,
  shouldHugJsExpression,
} from "./utils.js";

let uid = 0;

const settings = new Map([
  [
    "if",
    {
      shouldExpression: true,
      isFollowingBlock: false,
      followingBlocks: ["else if", "else"],
    },
  ],
  [
    "else if",
    {
      shouldExpression: true,
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
      shouldExpression: true,
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
      shouldExpression: true,
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

function printBlock(path, options, print) {
  return asyncPrintBlock;
}

async function asyncPrintBlock(textToDoc, print, path, options) {
  const node = path.node;
  const name = normalizeName(node.name);
  const setting = settings.get(name);
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

  contents.push("@", name);

  if (node.parameters.length || setting.shouldExpression) {
    const expression = await fetchExpression(name, textToDoc, node, path);
    contents.push(` (`, group(expression), `)`);
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

function shouldCloseBlock(node, names) {
  return (
    names.length === 0 ||
    !node.next ||
    !names.includes(normalizeName(node.next.name))
  );
}

async function fetchExpression(type, textToDoc, node, path) {
  const expressions = [];

  for (let param of path.node.parameters) {
    const expression = param.expression;
    expressions.push(expression, "; ");
  }

  // Remove the last ;
  if (expressions[expressions.length - 1] === "; ") {
    expressions.pop();
  }

  let value = expressions.join("");

  // defer / placeholder / loading is not angular expression
  if (["defer", "placeholder", "loading"].includes(type)) {
    return value;
  }

  try {
    value = await formatAttributeValue(value, textToDoc, {
      parser: "__ng_directive",
      __isInHtmlAttribute: true,
      __embeddedInHtml: true,
      trailingComma: "none",
    });
    return value;
  } catch (error) {}

  return value;
}

function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/gi, " ").trim();
}

export default printBlock;
