import {
  indent,
  softline,
  literalline,
  dedentToRoot,
} from "../../document/builders.js";
import { escapeTemplateCharacters } from "../print/template-literal.js";

async function embedMarkdown(textToDoc, print, path /*, options*/) {
  const { node } = path;
  let text = node.quasis[0].value.raw.replaceAll(
    /((?:\\\\)*)\\`/g,
    (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`"
  );
  const indentation = getIndentation(text);
  const hasIndent = indentation !== "";
  if (hasIndent) {
    text = text.replaceAll(new RegExp(`^${indentation}`, "gm"), "");
  }
  const doc = escapeTemplateCharacters(
    await textToDoc(text, { parser: "markdown", __inJsTemplate: true }),
    true
  );
  return [
    "`",
    hasIndent ? indent([softline, doc]) : [literalline, dedentToRoot(doc)],
    softline,
    "`",
  ];
}

function getIndentation(str) {
  const firstMatchedIndent = str.match(/^([^\S\n]*)\S/m);
  return firstMatchedIndent === null ? "" : firstMatchedIndent[1];
}

export default embedMarkdown;
