import { group, indent, mapDoc, softline } from "../document/index.js";
import { getPreferredQuote } from "../utilities/get-preferred-quote.js";

// Same helper as `language-html`'s `embed/utilities.js`: kept local instead
// of imported so the `glimmer` plugin bundle doesn't pull in `language-html`
// for a single 3-line helper.
function printExpand(doc) {
  return [indent([softline, doc]), softline];
}

function embed(path, options) {
  const { node } = path;

  if (node.type !== "TextNode") {
    return;
  }

  const { parent } = path;

  if (
    parent.type === "ElementNode" &&
    parent.tag === "style" &&
    parent.children.length === 1 &&
    parent.children[0] === node
  ) {
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
      (languageAttribute.value.chars === "" ||
        languageAttribute.value.chars === "css")
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

// Format `style="..."` attribute values as CSS, the same way `language-html`
// does. Only applies when the whole attribute value is plain text (i.e. it
// contains no `{{ ... }}` interpolation), since a partial CSS string can't
// be parsed on its own.
function embedStyleAttribute(path, options) {
  const { node } = path;

  // `printer-glimmer.js`'s `AttrNode` case picks the surrounding quote
  // character from this same raw text (before CSS reformatting). The CSS
  // printer is free to introduce its own quote characters (e.g. turning
  // `'stampfont'` into `"stampfont"`), so below we escape any occurrence of
  // whichever quote character ends up surrounding the attribute, exactly
  // like `language-html`'s attribute embedding does.
  const quote = getPreferredQuote(node.chars, options.singleQuote);

  return async (textToDoc) => {
    const context = node.chars;
    if (!context.trim()) {
      // An empty string is falsy, and `multiparser.js` only registers a doc
      // for a node when the returned doc is truthy, so use an empty array
      // (an empty doc that's still truthy) instead of `""` here.
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
