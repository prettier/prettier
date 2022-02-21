import doc from "../../document/index.js";
import { escapeTemplateCharacters } from "../print/template-literal.js";

const {
  builders: { indent, softline, literalline, dedentToRoot },
} = doc;

function format(path, print, textToDoc) {
  const node = path.getValue();
  let text = node.quasis[0].value.raw.replace(
    /((?:\\\\)*)\\`/g,
    (_, backslashes) => "\\".repeat(backslashes.length / 2) + "`"
  );
  const indentation = getIndentation(text);
  const hasIndent = indentation !== "";
  if (hasIndent) {
    text = text.replace(new RegExp(`^${indentation}`, "gm"), "");
  }
  const doc = escapeTemplateCharacters(
    textToDoc(
      text,
      { parser: "markdown", __inJsTemplate: true },
      { stripTrailingHardline: true }
    ),
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

export default format;
