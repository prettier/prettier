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

function clean(original, cloned) {
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
    const { fullName: name, value } = original;

    if (
      // HTML attributes
      name === "style" ||
      name === "class" ||
      name === "srcset" ||
      name.startsWith("on") ||
      // Vue attributes
      name.startsWith("@") ||
      name.startsWith(":") ||
      name.startsWith(".") ||
      name.startsWith("#") ||
      name.startsWith("v-") ||
      name === "vars" ||
      name === "setup" ||
      name === "generic" ||
      name === "slot-scope" ||
      // Angular attributes
      name.startsWith("(") ||
      name.startsWith("[") ||
      name.startsWith("*") ||
      name.startsWith("bind") ||
      name.startsWith("i18n") ||
      name.startsWith("on-") ||
      name.startsWith("ng-") ||
      value?.includes("{{")
    ) {
      delete cloned.value;
    } else if (value) {
      cloned.value = value.replaceAll(/'|&quot;|&apos;/gu, '"');
    }
  }

  if (original.type === "docType") {
    delete cloned.value;
  }

  if (
    original.type === "angularControlFlowBlock" &&
    original.parameters?.children
  ) {
    for (const parameter of cloned.parameters.children) {
      if (embeddedAngularControlFlowBlocks.has(original.name)) {
        delete parameter.expression;
      } else {
        parameter.expression = parameter.expression.trim();
      }
    }
  }

  if (original.type === "angularIcuExpression") {
    cloned.switchValue = original.switchValue.trim();
  }

  if (original.type === "angularLetDeclarationInitializer") {
    delete cloned.value;
  }
}

clean.ignoredProperties = ignoredProperties;

export default clean;
