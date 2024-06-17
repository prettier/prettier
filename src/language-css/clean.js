import isFrontMatter from "../utils/front-matter/is-front-matter.js";

const ignoredProperties = new Set([
  "raw", // front-matter
  "raws",
  "sourceIndex",
  "source",
  "before",
  "after",
  "trailingComma",
  "spaces",
]);

function clean(original, cloned, parent) {
  if (isFrontMatter(original) && original.language === "yaml") {
    delete cloned.value;
  }

  if (
    original.type === "css-comment" &&
    parent.type === "css-root" &&
    parent.nodes.length > 0
  ) {
    // --insert-pragma
    // first non-front-matter comment
    if (
      parent.nodes[0] === original ||
      (isFrontMatter(parent.nodes[0]) && parent.nodes[1] === original)
    ) {
      /**
       * something
       *
       * @format
       */
      delete cloned.text;

      // standalone pragma
      if (/^\*\s*@(?:format|prettier)\s*$/.test(original.text)) {
        return null;
      }
    }

    // Last comment is not parsed, when omitting semicolon, #8675
    if (parent.type === "css-root" && parent.nodes.at(-1) === original) {
      return null;
    }
  }

  if (original.type === "value-root") {
    delete cloned.text;
  }

  if (
    original.type === "media-query" ||
    original.type === "media-query-list" ||
    original.type === "media-feature-expression"
  ) {
    delete cloned.value;
  }

  if (original.type === "css-rule") {
    delete cloned.params;
  }

  if (
    (original.type === "media-feature" ||
      original.type === "media-keyword" ||
      original.type === "media-type" ||
      original.type === "media-unknown" ||
      original.type === "media-url" ||
      original.type === "media-value" ||
      original.type === "selector-attribute" ||
      original.type === "selector-string" ||
      original.type === "selector-class" ||
      original.type === "selector-combinator" ||
      original.type === "value-string") &&
    original.value
  ) {
    cloned.value = cleanCSSStrings(original.value);
  }

  if (original.type === "selector-combinator") {
    cloned.value = cloned.value.replaceAll(/\s+/g, " ");
  }

  if (original.type === "media-feature") {
    cloned.value = cloned.value.replaceAll(" ", "");
  }

  if (
    (original.type === "value-word" &&
      ((original.isColor && original.isHex) ||
        ["initial", "inherit", "unset", "revert"].includes(
          original.value.toLowerCase(),
        ))) ||
    original.type === "media-feature" ||
    original.type === "selector-root-invalid" ||
    original.type === "selector-pseudo"
  ) {
    cloned.value = cloned.value.toLowerCase();
  }
  if (original.type === "css-decl") {
    cloned.prop = original.prop.toLowerCase();
  }
  if (original.type === "css-atrule" || original.type === "css-import") {
    cloned.name = original.name.toLowerCase();
  }
  if (original.type === "value-number") {
    cloned.unit = original.unit.toLowerCase();
  }
  if (original.type === "value-unknown") {
    cloned.value = cloned.value.replaceAll(/;$/g, "");
  }

  if (original.type === "selector-attribute") {
    cloned.attribute = original.attribute.trim();

    if (original.namespace && typeof original.namespace === "string") {
      cloned.namespace = original.namespace.trim() || true;
    }

    if (original.value) {
      cloned.value = cloned.value.trim().replaceAll(/^["']|["']$/g, "");
      delete cloned.quoted;
    }
  }

  if (
    (original.type === "media-value" ||
      original.type === "media-type" ||
      original.type === "value-number" ||
      original.type === "selector-root-invalid" ||
      original.type === "selector-class" ||
      original.type === "selector-combinator" ||
      original.type === "selector-tag") &&
    original.value
  ) {
    cloned.value = cloned.value.replaceAll(
      /([\d+.e-]+)([a-z]*)/gi,
      (match, numStr, unit) => {
        const num = Number(numStr);
        return Number.isNaN(num) ? match : num + unit.toLowerCase();
      },
    );
  }

  if (original.type === "selector-tag") {
    const lowercasedValue = cloned.value.toLowerCase();

    if (["from", "to"].includes(lowercasedValue)) {
      cloned.value = lowercasedValue;
    }
  }

  // Workaround when `postcss-values-parser` parse `not`, `and` or `or` keywords as `value-func`
  if (
    original.type === "css-atrule" &&
    original.name.toLowerCase() === "supports"
  ) {
    delete cloned.value;
  }

  // Workaround for SCSS nested properties
  if (original.type === "selector-unknown") {
    delete cloned.value;
  }

  // Workaround for SCSS arbitrary arguments
  if (original.type === "value-comma_group") {
    const index = original.groups.findIndex(
      (node) => node.type === "value-number" && node.unit === "...",
    );

    if (index !== -1) {
      cloned.groups[index].unit = "";
      cloned.groups.splice(index + 1, 0, {
        type: "value-word",
        value: "...",
        isColor: false,
        isHex: false,
      });
    }
  }

  // We parse `@var[ foo ]` and `@var[foo]` differently
  if (
    original.type === "value-comma_group" &&
    original.groups.some(
      (node) =>
        (node.type === "value-atword" && node.value.endsWith("[")) ||
        (node.type === "value-word" && node.value.startsWith("]")),
    )
  ) {
    return {
      type: "value-atword",
      value: original.groups.map((node) => node.value).join(""),
      group: {
        open: null,
        close: null,
        groups: [],
        type: "value-paren_group",
      },
    };
  }
}

clean.ignoredProperties = ignoredProperties;

function cleanCSSStrings(value) {
  return value.replaceAll("'", '"').replaceAll(/\\([^\da-f])/gi, "$1");
}

export default clean;
