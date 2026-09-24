import {
  group,
  hardline,
  ifBreak,
  indent,
  softline,
} from "../../document/index.js";
import { isBinaryish } from "../utilities/node-types.js";
import { returnArgumentHasLeadingComment } from "../utilities/return-statement-has-leading-comment.js";
import { printSemicolon } from "./miscellaneous.js";

/**
@import {Doc} from "../../document/index.js";
*/

function printArgumentNode(path, options, print) {
  const { node } = path;
  const argumentDoc = print();

  if (returnArgumentHasLeadingComment(node, options)) {
    return ["(", indent([hardline, argumentDoc]), hardline, ")"];
  }

  if (
    isBinaryish(node) ||
    (options.experimentalTernaries &&
      node.type === "ConditionalExpression" &&
      (node.consequent.type === "ConditionalExpression" ||
        node.alternate.type === "ConditionalExpression"))
  ) {
    return group([
      ifBreak("("),
      indent([softline, argumentDoc]),
      softline,
      ifBreak(")"),
    ]);
  }

  return argumentDoc;
}

function printArgument(path, options, print) {
  if (!path.node.argument) {
    return "";
  }

  return [
    " ",
    path.call(() => printArgumentNode(path, options, print), "argument"),
  ];
}

function printReturnStatement(path, options, print) {
  return [
    "return",
    printArgument(path, options, print),
    printSemicolon(options),
  ];
}

function printThrowStatement(path, options, print) {
  return [
    "throw",
    printArgument(path, options, print),
    printSemicolon(options),
  ];
}

function printYieldExpression(path, options, print) {
  return [
    "yield",
    path.node.delegate ? "*" : "",
    printArgument(path, options, print),
  ];
}

export { printReturnStatement, printThrowStatement, printYieldExpression };
