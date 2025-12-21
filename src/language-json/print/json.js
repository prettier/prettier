import { hardline, indent, join } from "../../document/index.js";
import printString from "../../utilities/print-string.js";
import UnexpectedNodeError from "../../utilities/unexpected-node-error.js";
import { getRaw } from "../utilities.js";

function printJson(path, options, print) {
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
      return printString(getRaw(node), options);
    case "NumericLiteral": {
      // Intentionally to not use `printNumber`
      // We may start stop support number normalization like the string print
      const raw = getRaw(node);
      if (isObjectKey(path) && String(Number(raw)) === raw) {
        return `"${raw}"`;
      }

      return raw;
    }
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
      const { name } = key;
      cloned.key = {
        type: "StringLiteral",
        value: name,
        extra: { rawValue: name },
      };
    } else if (key.type === "NumericLiteral") {
      const raw = getRaw(key);
      if (String(Number(raw)) === raw) {
        cloned.key = {
          type: "StringLiteral",
          value: raw,
          extra: { rawValue: raw },
        };
      }
    }
  }

  if (type === "StringLiteral") {
    // We only remove `\` before `"`, but it's hard to detect if it's escaped
    delete cloned.extra.raw;
  }

  if (type === "UnaryExpression" && original.operator === "+") {
    return cloned.argument;
  }

  if (type === "ArrayExpression" || type === "ObjectExpression") {
    cloned.extra ??= {};
    if (original.extra?.trailingComma) {
      delete cloned.extra.trailingComma;
    }
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
    const value = original.quasis[0].value.cooked;
    return {
      type: "StringLiteral",
      value,
      extra: { rawValue: value },
    };
  }
}

clean.ignoredProperties = ignoredProperties;

export { clean, printJson };
