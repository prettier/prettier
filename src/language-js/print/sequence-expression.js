import {
  group,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/index.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { isReturnOrThrowStatement } from "../utilities/index.js";

function shouldIndentSequenceExpression(path, options) {
  const { key, parent } = path;
  if (
    key === "argument" &&
    isReturnOrThrowStatement(parent) &&
    needsParentheses(path, options)
  ) {
    return true;
  }

  if (key === "body" && parent.type === "ArrowFunctionExpression") {
    return true;
  }

  return false;
}

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

  if (shouldIndentSequenceExpression(path, options)) {
    return group(ifBreak([indent([softline, parts]), softline], parts));
  }

  return group(parts);
}

export { printSequenceExpression };
