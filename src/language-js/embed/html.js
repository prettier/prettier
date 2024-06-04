import {
  group,
  hardline,
  indent,
  label,
  line,
} from "../../document/builders.js";
import { mapDoc } from "../../document/utils.js";
import {
  printTemplateExpressions,
  uncookTemplateElementValue,
} from "../print/template-literal.js";
import { hasLanguageComment, isAngularComponentTemplate } from "./utils.js";

// The counter is needed to distinguish nested embeds.
let htmlTemplateLiteralCounter = 0;
async function printEmbedHtmlLike(parser, textToDoc, print, path, options) {
  const { node } = path;
  const counter = htmlTemplateLiteralCounter;
  htmlTemplateLiteralCounter = (htmlTemplateLiteralCounter + 1) >>> 0;

  const composePlaceholder = (index) =>
    `PRETTIER_HTML_PLACEHOLDER_${index}_${counter}_IN_JS`;

  const text = node.quasis
    .map((quasi, index, quasis) =>
      index === quasis.length - 1
        ? quasi.value.cooked
        : quasi.value.cooked + composePlaceholder(index),
    )
    .join("");

  const expressionDocs = printTemplateExpressions(path, print);

  const placeholderRegex = new RegExp(
    composePlaceholder(String.raw`(\d+)`),
    "g",
  );
  let topLevelCount = 0;
  const doc = await textToDoc(text, {
    parser,
    __onHtmlRoot(root) {
      topLevelCount = root.children.length;
    },
  });

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
            component = component.replaceAll(
              /<\/(?=script\b)/gi,
              String.raw`<\/`,
            );
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

  return label(
    { hug: false },
    group([
      "`",
      leadingWhitespace,
      topLevelCount > 1 ? indent(group(contentDoc)) : group(contentDoc),
      trailingWhitespace,
      "`",
    ]),
  );
}

/**
 *     - html`...`
 *     - HTML comment block
 */
function isHtml(path) {
  return (
    hasLanguageComment(path, "HTML") ||
    path.match(
      (node) => node.type === "TemplateLiteral",
      (node, name) =>
        node.type === "TaggedTemplateExpression" &&
        node.tag.type === "Identifier" &&
        node.tag.name === "html" &&
        name === "quasi",
    )
  );
}

const printEmbedHtml = printEmbedHtmlLike.bind(undefined, "html");
const printEmbedAngular = printEmbedHtmlLike.bind(undefined, "angular");

function printHtml(path /*, options*/) {
  if (isHtml(path)) {
    return printEmbedHtml;
  }

  if (isAngularComponentTemplate(path)) {
    return printEmbedAngular;
  }
}

export default printHtml;
