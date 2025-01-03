import {
  dedentToRoot,
  indent,
  literalline,
  softline,
} from "../../document/builders.js";
import { mapDoc } from "../../document/utils.js";
import {
  escapeTemplateCharacters,
  printTemplateExpressions,
} from "../print/template-literal.js";

async function printEmbedMarkdown(textToDoc, print, path /*, options*/) {
  const { node } = path;
  const composePlaceholder = (index) =>
    `PRETTIER_MD_PLACEHOLDER_${index}_IN_JS`;
  let hasIndent = false;
  let indentation;
  const text = node.quasis
    .map((quasi, index, quasis) => {
      let txt = quasi.value.raw.replaceAll(
        /((?:\\\\)*)\\`/gu,
        (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`",
      );
      if (index === 0) {
        indentation = getIndentation(txt);
        hasIndent = getIndentation(txt) !== "";
      }
      if (hasIndent) {
        txt = txt.replaceAll(new RegExp(`^${indentation}`, "gmu"), "");
      }
      return index === quasis.length - 1
        ? txt
        : txt + composePlaceholder(index);
    })
    .join("");

  const expressionDocs = printTemplateExpressions(path, print);
  const placeholderRegex = new RegExp(
    composePlaceholder(String.raw`(\d+)`),
    "gu",
  );
  const doc = escapeTemplateCharacters(
    await textToDoc(text, { parser: "markdown", __inJsTemplate: true }),
    true,
  );

  const contentDoc = mapDoc(doc, (doc) => {
    if (typeof doc !== "string") {
      return doc;
    }

    const parts = [];

    const components = doc.split(placeholderRegex);
    for (let i = 0; i < components.length; i++) {
      const component = components[i];

      if (i % 2 === 0) {
        if (component) {
          parts.push(component);
        }
        continue;
      }

      const placeholderIndex = Number(component);
      parts.push(expressionDocs[placeholderIndex]);
    }

    return parts;
  });

  return [
    "`",
    hasIndent
      ? indent([softline, contentDoc])
      : [literalline, dedentToRoot(contentDoc)],
    softline,
    "`",
  ];
}

function getIndentation(str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/mu);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

function printMarkdown(path /*, options*/) {
  if (isMarkdown(path)) {
    return printEmbedMarkdown;
  }
}

/**
 * md`...`
 * markdown`...`
 */
function isMarkdown({ node, parent }) {
  return (
    parent?.type === "TaggedTemplateExpression" &&
    node.quasis.length > 0 &&
    parent.tag.type === "Identifier" &&
    (parent.tag.name === "md" || parent.tag.name === "markdown")
  );
}

export default printMarkdown;
