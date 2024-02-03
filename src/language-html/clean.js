import isFrontMatter from "../utils/front-matter/is-front-matter.js";

const ignoredProperties = new Set([
  "sourceSpan",
  "startSourceSpan",
  "endSourceSpan",
  "nameSpan",
  "valueSpan",
  "keySpan",
  "tagDefinition",
  "tokens",
  "valueTokens",
  "switchValueSourceSpan",
  "expSourceSpan",
  "valueSourceSpan",
]);

const embeddedAngularControlFlowBlocks = new Set([
  "if",
  "else if",
  "for",
  "switch",
  "case",
]);

function clean(original, clone) {
  if (original.type === "text" || original.type === "comment") {
    return null;
  }

  // may be formatted by multiparser
  if (
    isFrontMatter(original) ||
    original.type === "yaml" ||
    original.type === "toml"
  ) {
    return null;
  }

  if (original.type === "attribute") {
    delete clone.value;
  }

  if (original.type === "docType") {
    delete clone.value;
  }

  if (
    original.type === "angularControlFlowBlock" &&
    clone.parameters?.children
  ) {
    for (const parameter of clone.parameters.children) {
      if (embeddedAngularControlFlowBlocks.has(original.name)) {
        delete parameter.expression;
      } else {
        parameter.expression = parameter.expression.trim();
      }
    }
  }

  if (original.type === "angularIcuExpression") {
    clone.switchValue = original.switchValue.trim();
  }
}

clean.ignoredProperties = ignoredProperties;

export default clean;
