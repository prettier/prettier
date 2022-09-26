import {
  indent,
  line,
  hardline,
  group,
  label,
} from "../../document/builders.js";
import { mapDoc } from "../../document/utils.js";
import {
  printTemplateExpressions,
  uncookTemplateElementValue,
} from "../print/template-literal.js";

// The counter is needed to distinguish nested embeds.
let htmlTemplateLiteralCounter = 0;
async function embedHtmlLike(parser, textToDoc, print, path, options) {
  const { node } = path;
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

  const placeholderRegex = new RegExp(composePlaceholder("(\\d+)"), "g");
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

  const resultDoc = group(
    linebreak
      ? ["`", indent([linebreak, group(contentDoc)]), linebreak, "`"]
      : [
          "`",
          leadingWhitespace,
          topLevelCount > 1 ? indent(group(contentDoc)) : group(contentDoc),
          trailingWhitespace,
          "`",
        ]
  );

  return linebreak ? resultDoc : label({ hug: false }, resultDoc);
}

export const embedHtml = embedHtmlLike.bind(undefined, "html");
export const embedAngular = embedHtmlLike.bind(undefined, "angular");
