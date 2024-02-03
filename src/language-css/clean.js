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

function clean(original, clone, parent) {
  if (isFrontMatter(original) && original.lang === "yaml") {
    delete clone.value;
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
      delete clone.text;

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
    delete clone.text;
  }

  if (
    original.type === "media-query" ||
    original.type === "media-query-list" ||
    original.type === "media-feature-expression"
  ) {
    delete clone.value;
  }

  if (original.type === "css-rule") {
    delete clone.params;
  }

  if (original.type === "selector-combinator") {
    clone.value = original.value.replaceAll(/\s+/g, " ");
  }

  if (original.type === "media-feature") {
    clone.value = original.value.replaceAll(" ", "");
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
    clone.value = original.value.toLowerCase();
  }
  if (original.type === "css-decl") {
    clone.prop = original.prop.toLowerCase();
  }
  if (original.type === "css-atrule" || original.type === "css-import") {
    clone.name = original.name.toLowerCase();
  }
  if (original.type === "value-number") {
    clone.unit = original.unit.toLowerCase();
  }
  if (original.type === "value-unknown") {
    clone.value = original.value.replaceAll(/;$/g, "");
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
    clone.value = cleanCSSStrings(original.value);
  }

  if (original.type === "selector-attribute") {
    clone.attribute = original.attribute.trim();

    if (original.namespace && typeof original.namespace === "string") {
      clone.namespace = original.namespace.trim();

      if (original.namespace.length === 0) {
        clone.namespace = true;
      }
    }

    if (original.value) {
      clone.value = original.value.trim().replaceAll(/^["']|["']$/g, "");
      delete clone.quoted;
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
    clone.value = original.value.replaceAll(
      /([\d+.e-]+)([a-z]*)/gi,
      (match, numStr, unit) => {
        const num = Number(numStr);
        return Number.isNaN(num) ? match : num + unit.toLowerCase();
      },
    );
  }

  if (original.type === "selector-tag") {
    const lowercasedValue = original.value.toLowerCase();

    if (["from", "to"].includes(lowercasedValue)) {
      clone.value = lowercasedValue;
    }
  }

  // Workaround when `postcss-values-parser` parse `not`, `and` or `or` keywords as `value-func`
  if (
    original.type === "css-atrule" &&
    original.name.toLowerCase() === "supports"
  ) {
    delete clone.value;
  }

  // Workaround for SCSS nested properties
  if (original.type === "selector-unknown") {
    delete clone.value;
  }

  // Workaround for SCSS arbitrary arguments
  if (original.type === "value-comma_group") {
    const index = original.groups.findIndex(
      (node) => node.type === "value-number" && node.unit === "...",
    );

    if (index !== -1) {
      clone.groups[index].unit = "";
      clone.groups.splice(index + 1, 0, {
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
