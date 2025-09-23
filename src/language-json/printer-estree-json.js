import { hardline, indent, join } from "../document/builders.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";

function genericPrint(path, options, print) {
  const { node } = path;
  switch (node.type) {
    case "JsonRoot":
      return [print("node"), hardline];
    case "ArrayExpression": {
      if (node.elements.length === 0) {
        return "[]";
      }

      const printed = path.map(
        () => (path.node === null ? "null" : print()),
        "elements",
      );

      return [
        "[",
        indent([hardline, join([",", hardline], printed)]),
        hardline,
        "]",
      ];
    }
    case "ObjectExpression":
      return node.properties.length === 0
        ? "{}"
        : [
            "{",
            indent([
              hardline,
              join([",", hardline], path.map(print, "properties")),
            ]),
            hardline,
            "}",
          ];
    case "ObjectProperty":
      return [print("key"), ": ", print("value")];
    case "UnaryExpression":
      return [node.operator === "+" ? "" : node.operator, print("argument")];
    case "NullLiteral":
      return "null";
    case "BooleanLiteral":
      return node.value ? "true" : "false";
    case "StringLiteral":
      return JSON.stringify(node.value);
    case "NumericLiteral":
      return isObjectKey(path)
        ? JSON.stringify(String(node.value))
        : JSON.stringify(node.value);
    case "Identifier":
      return isObjectKey(path) ? JSON.stringify(node.name) : node.name;
    case "TemplateLiteral":
      // There is only one `TemplateElement`
      return print(["quasis", 0]);
    case "TemplateElement":
      return JSON.stringify(node.value.cooked);
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "JSON");
  }
}

function isObjectKey(path) {
  return path.key === "key" && path.parent.type === "ObjectProperty";
}

const ignoredProperties = new Set([
  "start",
  "end",
  "extra",
  "loc",
  "comments",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "errors",
  "range",
  "tokens",
]);

function clean(original, cloned /* , parent*/) {
  const { type } = original;
  // We print quoted key
  if (type === "ObjectProperty") {
    const { key } = original;
    if (key.type === "Identifier") {
      cloned.key = { type: "StringLiteral", value: key.name };
    } else if (key.type === "NumericLiteral") {
      cloned.key = { type: "StringLiteral", value: String(key.value) };
    }
    return;
  }
  if (type === "UnaryExpression" && original.operator === "+") {
    return cloned.argument;
  }
  // We print holes in array as `null`
  if (type === "ArrayExpression") {
    for (const [index, element] of original.elements.entries()) {
      if (element === null) {
        cloned.elements.splice(index, 0, { type: "NullLiteral" });
      }
    }
    return;
  }
  // We print `TemplateLiteral` as string
  if (type === "TemplateLiteral") {
    return { type: "StringLiteral", value: original.quasis[0].value.cooked };
  }
}

clean.ignoredProperties = ignoredProperties;

export { clean as massageAstNode, genericPrint as print };
export { default as getVisitorKeys } from "./get-visitor-keys.js";
