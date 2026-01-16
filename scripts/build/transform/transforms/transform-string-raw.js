import jsesc from "jsesc";
import { createStringLiteral, isIdentifier } from "./utilities.js";

/**
 * @param {import("@babel/types").Node} node
 * @returns {boolean}
 */
function isStringRaw(node) {
  return (
    node.type === "TaggedTemplateExpression" &&
    node.tag.type === "MemberExpression" &&
    !node.tag.computed &&
    !node.tag.optional &&
    isIdentifier(node.tag.object, "String") &&
    isIdentifier(node.tag.property, "raw")
  );
}

/**
 * `` String.raw`foo` `` -> `"foo"`
 * `` String.raw`foo ${"bar"}` `` -> `` `foo ${"bar"}` ``
 *
 * @param {import("@babel/types").TaggedTemplateExpression} node
 * @returns {import("@babel/types").TaggedTemplateExpression}
 */
function transformStringRaw(taggedTemplateExpression) {
  const templateLiteral = taggedTemplateExpression.quasi;

  if (templateLiteral.expressions.length === 0) {
    const { raw } = templateLiteral.quasis[0].value;
    const value = new Function(`return \`${jsesc(raw)}\``)();
    return createStringLiteral(value);
  }

  const quasis = templateLiteral.quasis.map((quasis) => {
    const { raw } = quasis.value;
    return { ...quasis, value: { ...quasis, raw: jsesc(raw) } };
  });

  return { ...templateLiteral, quasis };
}

export default {
  shouldSkip: (text /* , file*/) => !text.includes("String.raw`"),
  test: isStringRaw,
  transform: transformStringRaw,
};
