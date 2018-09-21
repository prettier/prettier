"use strict";

const parseFrontMatter = require("../utils/front-matter");
const { HTML_TAGS } = require("./utils");

function parse(text /*, parsers, opts*/) {
  const { frontMatter, content } = parseFrontMatter(text);

  // Inline the require to avoid loading all the JS if we don't use it
  const htmlparser2 = require("htmlparser2");

  /**
   * modifications:
   * - empty attributes (e.g., `<tag attr>`) are parsed as `{ [attr]: null }` instead of `{ [attr]: "" }`
   * - trigger `Handler#onselfclosingtag()`
   */
  class CustomParser extends htmlparser2.Parser {
    constructor(cbs, options) {
      super(cbs, options);
      this._attribvalue = null;
    }
    onattribdata(value) {
      if (this._attribvalue === null) {
        this._attribvalue = "";
      }
      super.onattribdata(value);
    }
    onattribend() {
      super.onattribend();
      this._attribvalue = null;
    }
    onselfclosingtag() {
      if (this._options.xmlMode || this._options.recognizeSelfClosing) {
        const name = this._tagname;
        this.onopentagend();
        if (this._stack[this._stack.length - 1] === name) {
          this._cbs.onselfclosingtag();
          this._cbs.onclosetag(name);
          this._stack.pop();
        }
      } else {
        this.onopentagend();
      }
    }
  }

  /**
   * modifications:
   * - add `selfClosing` field
   */
  class CustomDomHandler extends htmlparser2.DomHandler {
    onselfclosingtag() {
      this._tagStack[this._tagStack.length - 1].selfClosing = true;
    }
  }

  const handler = new CustomDomHandler({
    withStartIndices: true,
    withEndIndices: true
  });

  new CustomParser(handler, {
    lowerCaseTags: true, // preserve lowercase tag names to avoid false check in htmlparser2 and apply the lowercasing later
    lowerCaseAttributeNames: false,
    recognizeSelfClosing: true
  }).end(content);

  const ast = normalize({ type: "root", children: handler.dom }, text);

  if (frontMatter) {
    ast.children.unshift(frontMatter);
  }

  return ast;
}

function normalize(node, text) {
  delete node.parent;
  delete node.next;
  delete node.prev;

  let isCaseSensitiveTag = false;

  if (node.type === "tag" && !(node.name in HTML_TAGS)) {
    isCaseSensitiveTag = true;
    node.name = text.slice(
      node.startIndex + 1, // <
      node.startIndex + 1 + node.name.length
    );
  }

  if (node.attribs) {
    node.attributes = Object.keys(node.attribs).map(attributeKey => ({
      type: "attribute",
      key: isCaseSensitiveTag ? attributeKey : attributeKey.toLowerCase(),
      value: node.attribs[attributeKey]
    }));
  }

  if (node.children) {
    node.children = node.children.map(child => normalize(child, text));
  }

  return node;
}

module.exports = {
  parsers: {
    parse5: {
      parse,
      astFormat: "htmlparser2",
      locStart: node => node.startIndex,
      locEnd: node => node.endIndex + 1
    }
  }
};
