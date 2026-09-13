import { indent, replaceEndOfLine, softline } from "../document/index.js";
import { replacePlaceholders } from "../language-js/embed/css.js";
import { locEnd, locStart } from "./loc.js";
import { printStartingTag } from "./print/tag.js";
import { isPlainTextElement } from "./utilities.js";

function getAttribute(node, name) {
  return node.attributes.find(
    (attribute) => attribute.type === "AttrNode" && attribute.name === name,
  );
}

function getTextValue(attribute) {
  return attribute.value.type === "TextNode"
    ? attribute.value.chars
    : undefined;
}

function getScriptTextToDocOptions(node) {
  if (getAttribute(node, "src")) {
    return;
  }

  const typeAttribute = getAttribute(node, "type");
  const type = typeAttribute ? getTextValue(typeAttribute) : undefined;

  if (!typeAttribute || type === "module" || type === "text/javascript") {
    return {
      parser: "babel",
      __embeddedInHtml: true,
      __babelSourceType: type === "module" ? "module" : "script",
    };
  }
}

function isEmbedCss(node) {
  if (node.type !== "ElementNode" || node.tag !== "style") {
    return false;
  }

  const langAttribute = getAttribute(node, "lang");
  return !langAttribute || getTextValue(langAttribute) === "css";
}

async function printEmbedCss(textToDoc, print, path, options) {
  const { node } = path;

  let text = "";
  const mustacheDocs = [];
  for (const child of node.children) {
    if (child.type === "TextNode") {
      text += child.chars;
      continue;
    }

    text += `@prettier-placeholder-${mustacheDocs.length}-id`;
    mustacheDocs.push(
      replaceEndOfLine(
        options.originalText.slice(locStart(child), locEnd(child)),
      ),
    );
  }

  if (!text.trim()) {
    return [printStartingTag(path, options, print), "</style>"];
  }

  const doc = await textToDoc(text, { parser: "css" });
  const contentDoc = replacePlaceholders(doc, mustacheDocs);

  /* c8 ignore next 3 */
  if (!contentDoc) {
    throw new Error("Couldn't insert all the mustaches");
  }

  return [
    printStartingTag(path, options, print),
    indent([softline, contentDoc]),
    softline,
    "</style>",
  ];
}

function embed(path /* , options*/) {
  const { node } = path;

  if (isEmbedCss(node)) {
    return printEmbedCss;
  }

  if (node.type !== "TextNode") {
    return;
  }

  const { parent } = path;

  if (!(
    isPlainTextElement(parent) &&
    parent.tag === "script" &&
    parent.children[0] === node
  )) {
    return;
  }

  const textToDocOptions = getScriptTextToDocOptions(parent);

  if (!textToDocOptions) {
    return;
  }

  return async (textToDoc) => {
    const content = node.chars;
    if (!content.trim()) {
      return "";
    }
    return await textToDoc(content, textToDocOptions);
  };
}

export default embed;
