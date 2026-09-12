import { group, indent, mapDoc, softline } from "../document/index.js";
import { getPreferredQuote } from "../utilities/get-preferred-quote.js";
import { isPlainTextStyleElement } from "./utilities.js";

function printExpand(doc) {
  return [indent([softline, doc]), softline];
}

function embed(path, options) {
  const { node } = path;

  if (node.type !== "TextNode") {
    return;
  }

  const { parent } = path;

  if (isPlainTextStyleElement(parent) && parent.children[0] === node) {
    return embedStyleElement(path);
  }

  if (parent.type === "AttrNode" && parent.name.toLowerCase() === "style") {
    return embedStyleAttribute(path, options);
  }
}

function embedStyleElement(path) {
  const { node, parent } = path;

  const languageAttribute = parent.attributes.find(
    (attribute) => attribute.type === "AttrNode" && attribute.name === "lang",
  );
  if (
    languageAttribute &&
    !(
      languageAttribute.value.type === "TextNode" &&
      languageAttribute.value.chars === "css"
    )
  ) {
    return;
  }

  return async (textToDoc) => {
    const context = node.chars;
    if (!context.trim()) {
      return "";
    }
    const doc = await textToDoc(context, { parser: "css" });
    return doc;
  };
}

function embedStyleAttribute(path, options) {
  const { node } = path;
  const quote = getPreferredQuote(node.chars, options.singleQuote);

  return async (textToDoc) => {
    const context = node.chars;
    if (!context.trim()) {
      return [];
    }
    const doc = await textToDoc(context, {
      parser: "css",
      __isHTMLStyleAttribute: true,
    });
    const escapedDoc = mapDoc(doc, (doc) =>
      typeof doc === "string" && quote
        ? doc.replaceAll(quote, quote === '"' ? "&quot;" : "&#39;")
        : doc,
    );
    return group(printExpand(escapedDoc));
  };
}

export default embed;
