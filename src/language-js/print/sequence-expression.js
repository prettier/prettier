import {
  group,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/index.js";

function printSequenceExpression(path, options, print) {
  const { parent } = path;
  if (parent.type === "ExpressionStatement" || parent.type === "ForStatement") {
    // For ExpressionStatements and for-loop heads, which are among
    // the few places a SequenceExpression appears unparenthesized, we want
    // to indent expressions after the first.
    const parts = [];
    path.each(({ isFirst }) => {
      if (isFirst) {
        parts.push(print());
      } else {
        parts.push(",", indent([line, print()]));
      }
    }, "expressions");
    return group(parts);
  }

  const parts = join([",", line], path.map(print, "expressions"));

  if (
    ((parent.type === "ReturnStatement" || parent.type === "ThrowStatement") &&
      path.key === "argument") ||
    (parent.type === "ArrowFunctionExpression" && path.key === "body")
  ) {
    return group(ifBreak([indent([softline, parts]), softline], parts));
  }

  return group(parts);
}

export { printSequenceExpression };
