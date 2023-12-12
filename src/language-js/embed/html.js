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
import { isAngularComponentTemplate, hasLanguageComment } from "./utils.js";

function getVariableName(expression) {
  if (expression.type === "Identifier") {
    return expression.name;
  }

  if (expression.type === "ThisExpression") {
    return "this";
  }

  if (expression.type === "MemberExpression") {
    const objectName = getVariableName(expression.object);
    const propertyName = getVariableName(expression.property);
    if (objectName && propertyName) {
      return objectName + "." + propertyName;
    }
  }
}

// The counter is needed to distinguish nested embeds.
let htmlTemplateLiteralCounter = 0;
async function printEmbedHtmlLike(parser, textToDoc, print, path, options) {
  const { node } = path;
  const counter = htmlTemplateLiteralCounter;
  htmlTemplateLiteralCounter = (htmlTemplateLiteralCounter + 1) >>> 0;

  const variableNameIndexLookup = {};
  const composePlaceholder = (index) => {
    let placeholder = index;

    const nextExpression = node.expressions[index];
    if (nextExpression) {
      const variableName = getVariableName(nextExpression);

      if (variableName) {
        if (Object.hasOwn(variableNameIndexLookup, variableName)) {
          placeholder = variableNameIndexLookup[variableName];
        } else {
          variableNameIndexLookup[variableName] = index;
        }
      }
    }

    return `PRETTIER_HTML_PLACEHOLDER_${placeholder}_${counter}_IN_JS`;
  };

  const text = node.quasis
    .map((quasi, index, quasis) =>
      index === quasis.length - 1
        ? quasi.value.cooked
        : quasi.value.cooked + composePlaceholder(index),
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
            component = component.replaceAll(/<\/(?=script\b)/gi, "<\\/");
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
