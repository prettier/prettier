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

function clean(original, cloned, parent) {
  if (original.kind === "text" || original.kind === "comment") {
    return null;
  }

  // may be formatted by multiparser
  if (original.kind === "yaml") {
    delete cloned.value;
  }

  if (original.kind === "attribute") {
    const { fullName: name, value } = original;

    if (
      // HTML attributes
      name === "style" ||
      name === "class" ||
      (name === "srcset" &&
        (parent.fullName === "img" || parent.fullName === "source")) ||
      (name === "allow" && parent.fullName === "iframe") ||
      name.startsWith("on") ||
      // Vue attributes
      name.startsWith("@") ||
      name.startsWith(":") ||
      name.startsWith(".") ||
      name.startsWith("#") ||
      name.startsWith("v-") ||
      (name === "vars" && parent.fullName === "style") ||
      ((name === "setup" || name === "generic") &&
        parent.fullName === "script") ||
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

  if (original.kind === "docType") {
    cloned.value = original.value.toLowerCase().replaceAll(/\s+/gu, " ");
  }

  if (
    original.kind === "angularControlFlowBlock" &&
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

  if (original.kind === "angularIcuExpression") {
    cloned.switchValue = original.switchValue.trim();
  }

  if (original.kind === "angularLetDeclarationInitializer") {
    delete cloned.value;
  }

  // We always print void tags as self closing
  if (
    original.kind === "element" &&
    original.isVoid &&
    !original.isSelfClosing
  ) {
    cloned.isSelfClosing = true;
  }
}

clean.ignoredProperties = ignoredProperties;

export default clean;
