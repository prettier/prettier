import { getRaw } from "./utilities.js";

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

export default clean;
