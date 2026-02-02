import { group, hardline, indent, line } from "../../document/index.js";
import { hasComment } from "../utilities/comments.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

function printVariableDeclaration(path, options, print) {
  const { node } = path;
  const printed = path.map(print, "declarations");

  // We generally want to terminate all variable declarations with a
  // semicolon, except when they in the () part of for loops.

  const isForXInitializer =
    (path.key === "init" && path.parent.type === "ForStatement") ||
    (path.key === "left" &&
      (path.parent.type === "ForInStatement" ||
        path.parent.type === "ForOfStatement"));

  const hasValue = node.declarations.some((declarator) => declarator.init);

  let firstVariable;
  if (printed.length === 1 && !hasComment(node.declarations[0])) {
    firstVariable = printed[0];
  } else {
    // Indent first var to comply with eslint one-var rule
    firstVariable = indent(printed[0]);
  }

  return group([
    printDeclareToken(path),
    node.kind,
    firstVariable ? [" ", firstVariable] : "",
    indent(
      printed
        .slice(1)
        .map((doc) => [
          ",",
          hasValue && !isForXInitializer ? hardline : line,
          doc,
        ]),
    ),
    isForXInitializer ? "" : printSemicolon(options),
  ]);
}

export { printVariableDeclaration };
