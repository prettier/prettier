import { group, indent, mapDoc, softline } from "../document/index.js";
import { getPreferredQuote } from "../utilities/get-preferred-quote.js";
import { isPlainTextStyleOrScriptElement } from "./utilities.js";

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

function getStyleTextToDocOptions(node) {
  const langAttribute = getAttribute(node, "lang");
  if (!langAttribute || getTextValue(langAttribute) === "css") {
    return { parser: "css" };
  }
}

function printExpand(doc) {
  return [indent([softline, doc]), softline];
}

function embed(path, options) {
  const { node } = path;

  if (node.type !== "TextNode") {
    return;
  }

  const { parent } = path;

  if (isPlainTextStyleOrScriptElement(parent) && parent.children[0] === node) {
    return embedStyleOrScriptElement(path);
  }

  if (parent.type === "AttrNode" && parent.name.toLowerCase() === "style") {
    return embedStyleAttribute(path, options);
  }
}

function embedStyleOrScriptElement(path) {
  const { node, parent } = path;

  const textToDocOptions =
    parent.tag === "style"
      ? getStyleTextToDocOptions(parent)
      : getScriptTextToDocOptions(parent);

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
