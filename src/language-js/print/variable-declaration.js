import { group, hardline, indent, line } from "../../document/index.js";
import { hasComment } from "../utilities/index.js";
import { printDeclareToken } from "./miscellaneous.js";

function printVariableDeclaration(path, options, print) {
  const { node } = path;
  const printed = path.map(print, "declarations");

  // We generally want to terminate all variable declarations with a
  // semicolon, except when they in the () part of for loops.
  const parentNode = path.parent;

  const isParentForLoop =
    parentNode.type === "ForStatement" ||
    parentNode.type === "ForInStatement" ||
    parentNode.type === "ForOfStatement";

  const hasValue = node.declarations.some((decl) => decl.init);

  let firstVariable;
  if (printed.length === 1 && !hasComment(node.declarations[0])) {
    firstVariable = printed[0];
  } else if (printed.length > 0) {
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
        .map((p) => [",", hasValue && !isParentForLoop ? hardline : line, p]),
    ),
    options.semi && !(isParentForLoop && parentNode.body !== node) ? ";" : "",
  ]);
}

export { printVariableDeclaration };
