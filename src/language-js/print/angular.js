import { join, line, group } from "../../document/builders.js";
import { hasNode, hasComment, getComments } from "../utils/index.js";
import { printBinaryishExpression } from "./binaryish.js";

/** @typedef {import("../../common/ast-path.js").default} AstPath */

async function printAngular(path, options, print) {
  const node = path.getValue();

  // Angular nodes always starts with `NG`
  if (!node.type.startsWith("NG")) {
    return;
  }

  switch (node.type) {
    case "NGRoot":
      return [
        await print("node"),
        !hasComment(node.node)
          ? ""
          : " //" + getComments(node.node)[0].value.trimEnd(),
      ];
    case "NGPipeExpression":
      return printBinaryishExpression(path, options, print);
    case "NGChainedExpression":
      return group(
        join(
          [";", line],
          await path.map(
            async (childPath) =>
              hasNgSideEffect(childPath) ? print() : ["(", await print(), ")"],
            "expressions"
          )
        )
      );
    case "NGEmptyExpression":
      return "";
    case "NGQuotedExpression":
      return [node.prefix, ": ", node.value.trim()];
    case "NGMicrosyntax":
      return path.map(
        async (childPath, index) => [
          index === 0
            ? ""
            : isNgForOf(childPath.getValue(), index, node)
            ? " "
            : [";", line],
          await print(),
        ],
        "body"
      );
    case "NGMicrosyntaxKey":
      return /^[$_a-z][\w$]*(?:-[$_a-z][\w$])*$/i.test(node.name)
        ? node.name
        : JSON.stringify(node.name);
    case "NGMicrosyntaxExpression":
      return [
        await print("expression"),
        node.alias === null ? "" : [" as ", await print("alias")],
      ];
    case "NGMicrosyntaxKeyedExpression": {
      const index = path.getName();
      const parentNode = path.getParentNode();
      const shouldNotPrintColon =
        isNgForOf(node, index, parentNode) ||
        (((index === 1 &&
          (node.key.name === "then" || node.key.name === "else")) ||
          (index === 2 &&
            node.key.name === "else" &&
            parentNode.body[index - 1].type ===
              "NGMicrosyntaxKeyedExpression" &&
            parentNode.body[index - 1].key.name === "then")) &&
          parentNode.body[0].type === "NGMicrosyntaxExpression");
      return [
        await print("key"),
        shouldNotPrintColon ? " " : ": ",
        await print("expression"),
      ];
    }
    case "NGMicrosyntaxLet":
      return [
        "let ",
        await print("key"),
        node.value === null ? "" : [" = ", await print("value")],
      ];
    case "NGMicrosyntaxAs":
      return [await print("key"), " as ", await print("alias")];
    default:
      /* istanbul ignore next */
      throw new Error(
        `Unknown Angular node type: ${JSON.stringify(node.type)}.`
      );
  }
}

function isNgForOf(node, index, parentNode) {
  return (
    node.type === "NGMicrosyntaxKeyedExpression" &&
    node.key.name === "of" &&
    index === 1 &&
    parentNode.body[0].type === "NGMicrosyntaxLet" &&
    parentNode.body[0].value === null
  );
}

/** identify if an angular expression seems to have side effects */
/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function hasNgSideEffect(path) {
  return hasNode(path.getValue(), (node) => {
    switch (node.type) {
      case undefined:
        return false;
      case "CallExpression":
      case "OptionalCallExpression":
      case "AssignmentExpression":
        return true;
    }
  });
}

export { printAngular };
