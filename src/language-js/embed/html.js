"use strict";

const {
  builders: { indent, line, hardline, group },
  utils: { mapDoc },
} = require("../../document");
const {
  printTemplateExpressions,
  uncookTemplateElementValue,
} = require("../print/template-literal");

// The counter is needed to distinguish nested embeds.
let htmlTemplateLiteralCounter = 0;
function format(path, print, textToDoc, options, { parser }) {
  const node = path.getValue();
  const counter = htmlTemplateLiteralCounter;
  htmlTemplateLiteralCounter = (htmlTemplateLiteralCounter + 1) >>> 0;

  const composePlaceholder = (index) =>
    `PRETTIER_HTML_PLACEHOLDER_${index}_${counter}_IN_JS`;

  const text = node.quasis
    .map((quasi, index, quasis) =>
      index === quasis.length - 1
        ? quasi.value.cooked
        : quasi.value.cooked + composePlaceholder(index)
    )
    .join("");

  const expressionDocs = printTemplateExpressions(path, print);
  if (expressionDocs.length === 0 && text.trim().length === 0) {
    return "``";
  }

  const placeholderRegex = new RegExp(composePlaceholder("(\\d+)"), "g");
  let topLevelCount = 0;
  const doc = textToDoc(
    text,
    {
      parser,
      __onHtmlRoot(root) {
        topLevelCount = root.children.length;
      },
    },
    { stripTrailingHardline: true }
  );

  const contentDoc = mapDoc(doc, (doc) => {
    if (typeof doc !== "string") {
      return doc;
    }

    const parts = [];

    const components = doc.split(placeholderRegex);
    for (let i = 0; i < components.length; i++) {
      let component = components[i];

      if (i % 2 === 0) {
        if (component) {
          component = uncookTemplateElementValue(component);
          if (options.__embeddedInHtml) {
            component = component.replace(/<\/(script)\b/gi, "<\\/$1");
          }
          parts.push(component);
        }
        continue;
      }

      const placeholderIndex = Number(component);
      parts.push(expressionDocs[placeholderIndex]);
    }

    return parts;
  });

  const leadingWhitespace = /^\s/.test(text) ? " " : "";
  const trailingWhitespace = /\s$/.test(text) ? " " : "";

  const linebreak =
    options.htmlWhitespaceSensitivity === "ignore"
      ? hardline
      : leadingWhitespace && trailingWhitespace
      ? line
      : null;

  if (linebreak) {
    return group(["`", indent([linebreak, group(contentDoc)]), linebreak, "`"]);
  }

  return group([
    "`",
    leadingWhitespace,
    topLevelCount > 1 ? indent(group(contentDoc)) : group(contentDoc),
    trailingWhitespace,
    "`",
  ]);
}

module.exports = format;
