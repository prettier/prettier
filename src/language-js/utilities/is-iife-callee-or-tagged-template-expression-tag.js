import { isCallExpression } from "./node-types.js";

function isIifeCalleeOrTaggedTemplateExpressionTag(path) {
  const { node } = path;
  return (
    (node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression") &&
    ((path.key === "callee" && isCallExpression(path.parent)) ||
      (path.key === "tag" && path.parent.type === "TaggedTemplateExpression"))
  );
}

export { isIifeCalleeOrTaggedTemplateExpressionTag };
