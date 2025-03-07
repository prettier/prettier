import {
  dedentToRoot,
  indent,
  literalline,
  softline,
} from "../../document/builders.js";
import { escapeTemplateCharacters } from "../print/template-literal.js";

async function printEmbedMarkdown(textToDoc, print, path /*, options*/) {
  const { node } = path;
  let text = node.quasis[0].value.raw.replaceAll(
    /((?:\\\\)*)\\`/gu,
    (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`",
  );
  const indentation = getIndentation(text);
  const hasIndent = indentation !== "";
  if (hasIndent) {
    text = text.replaceAll(new RegExp(`^${indentation}`, "gmu"), "");
  }
  const doc = escapeTemplateCharacters(
    await textToDoc(text, { parser: "markdown", __inJsTemplate: true }),
    true,
  );
  return [
    "`",
    hasIndent ? indent([softline, doc]) : [literalline, dedentToRoot(doc)],
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
    node.quasis.length === 1 &&
    parent.tag.type === "Identifier" &&
    (parent.tag.name === "md" || parent.tag.name === "markdown")
  );
}

export default printMarkdown;
