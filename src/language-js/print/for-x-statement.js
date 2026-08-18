import { group, indent, softline, willBreak } from "../../document/index.js";
import { printForXStatementBody } from "./clause.js";

function printForXStatement(path, options, print) {
  const { node } = path;
  const isForOfStatement = node.type === "ForOfStatement";
  const headParts = [
    print("left"),
    " ",
    isForOfStatement ? "of" : "in",
    " ",
    print("right"),
  ];

  return group([
    "for",
    isForOfStatement && node.await ? " await" : "",
    " (",
    // Only make the head breakable when something in it forces a break, such as
    // a trailing line comment. Left flat, that comment has nowhere to go and is
    // printed after the closing parenthesis instead. Everything else keeps the
    // flat head so a breaking argument can still hug it.
    willBreak(headParts)
      ? group([indent([softline, headParts]), softline])
      : headParts,
    ")",
    printForXStatementBody(path, options, print),
  ]);
}

export { printForXStatement };
