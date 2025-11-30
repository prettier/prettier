import {
  conditionalGroup,
  group,
  ifBreak,
  indent,
  softline,
} from "../../document/index.js";
import { isArrayExpression, isObjectExpression } from "../utilities/index.js";

function printTypeAssertion(path, options, print) {
  const { node } = path;
  const shouldBreakAfterCast = !(
    isArrayExpression(node.expression) || isObjectExpression(node.expression)
  );

  const castGroup = group([
    "<",
    indent([softline, print("typeAnnotation")]),
    softline,
    ">",
  ]);

  const exprContents = [
    ifBreak("("),
    indent([softline, print("expression")]),
    softline,
    ifBreak(")"),
  ];

  if (shouldBreakAfterCast) {
    return conditionalGroup([
      [castGroup, print("expression")],
      [castGroup, group(exprContents, { shouldBreak: true })],
      [castGroup, print("expression")],
    ]);
  }
  return group([castGroup, print("expression")]);
}

export { printTypeAssertion };
