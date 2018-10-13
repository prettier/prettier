"use strict";

const parseFrontMatter = require("../utils/front-matter");
const { HTML_ELEMENT_ATTRIBUTES, HTML_TAGS, mapNode } = require("./utils");

function parse(text, parsers, options, { shouldParseFrontMatter = true } = {}) {
  const { frontMatter, content } = shouldParseFrontMatter
    ? parseFrontMatter(text)
    : { frontMatter: null, content: text };

  // Inline the require to avoid loading all the JS if we don't use it
  const Parser = require("htmlparser2/lib/Parser");
  const DomHandler = require("domhandler");

  /**
   * modifications:
   * - empty attributes (e.g., `<tag attr>`) are parsed as `{ [attr]: null }` instead of `{ [attr]: "" }`
   * - trigger `Handler#onselfclosingtag()`
   */
  class CustomParser extends Parser {
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
      if (this._cbs.onattribute) {
        this._cbs.onattribute(this._attribname, this._attribvalue);
      }
      if (this._attribs) {
        this._attribs.push([this._attribname, this._attribvalue]);
      }
      this._attribname = "";
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
    onopentagname(name) {
      super.onopentagname(name);
      if (this._cbs.onopentag) {
        this._attribs = [];
      }
    }
  }

  /**
   * modifications:
   * - add `isSelfClosing` field
   * - correct `endIndex` for whitespaces before closing tag end marker (e.g., `<x></x\n>`)
   */
  class CustomDomHandler extends DomHandler {
    onselfclosingtag() {
      this._tagStack[this._tagStack.length - 1].isSelfClosing = true;
    }
    onclosetag() {
      const elem = this._tagStack.pop();
      if (this._options.withEndIndices && elem) {
        const buffer = this._parser._tokenizer._buffer;
        let endIndex = this._parser.endIndex;
        while (buffer[endIndex] && buffer[endIndex] !== ">") {
          endIndex++;
        }
        elem.endIndex = buffer[endIndex] ? endIndex : this._parser.endIndex;
      }
      if (this._elementCB) {
        this._elementCB(elem);
      }
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

  const ast = normalize(
    {
      type: "root",
      children: handler.dom,
      startIndex: 0,
      endIndex: text.length
    },
    text
  );

  if (frontMatter) {
    ast.children.unshift(frontMatter);
  }

  const parseHtml = data =>
    parse(data, parsers, options, {
      shouldParseFrontMatter: false
    });

  return mapNode(ast, node => {
    const ieConditionalComment = parseIeConditionalComment(node, parseHtml);
    return ieConditionalComment ? ieConditionalComment : node;
  });
}

function parseIeConditionalComment(node, parseHtml) {
  if (node.type !== "comment") {
    return null;
  }

  const match = node.data.match(/^(\[if([^\]]*?)\]>)([\s\S]*?)<!\s*\[endif\]$/);

  if (!match) {
    return null;
  }

  const [, openingTagSuffix, condition, data] = match;
  const subTree = parseHtml(data);
  const baseIndex = node.startIndex + "<!--".length + openingTagSuffix.length;

  return Object.assign(
    {},
    mapNode(subTree, currentNode =>
      Object.assign({}, currentNode, {
        startIndex: baseIndex + currentNode.startIndex,
        endIndex: baseIndex + currentNode.endIndex
      })
    ),
    {
      type: "ieConditionalComment",
      condition: condition.trim().replace(/\s+/g, " ")
    }
  );
}

function normalize(node, text) {
  delete node.parent;
  delete node.next;
  delete node.prev;

  if (node.type === "tag" && !(node.name in HTML_TAGS)) {
    node.name = text.slice(
      node.startIndex + 1, // <
      node.startIndex + 1 + node.name.length
    );
  }

  if (node.attribs) {
    const CURRENT_HTML_ELEMENT_ATTRIBUTES =
      HTML_ELEMENT_ATTRIBUTES[node.name] || Object.create(null);
    const attributes = node.attribs.map(([attributeKey, attributeValue]) => {
      const lowerCaseAttributeKey = attributeKey.toLowerCase();
      return {
        type: "attribute",
        key:
          lowerCaseAttributeKey in HTML_ELEMENT_ATTRIBUTES["*"] ||
          lowerCaseAttributeKey in CURRENT_HTML_ELEMENT_ATTRIBUTES
            ? lowerCaseAttributeKey
            : attributeKey,
        value: attributeValue
      };
    });

    const attribs = Object.create(null);
    for (const attribute of attributes) {
      attribs[attribute.key] = attribute.value;
    }

    node.attribs = attribs;
    node.attributes = attributes;
  }

  if (node.children) {
    node.children = node.children.map(child => normalize(child, text));
  }

  if (
    node.type === "tag" &&
    node.name === "textarea" &&
    node.children.length === 1 &&
    node.children[0].type === "text" &&
    node.children[0].data === "\n" &&
    !/<\/textarea>$/.test(text.slice(locStart(node), locEnd(node)))
  ) {
    node.children = [];
  }

  return node;
}

function locStart(node) {
  return node.startIndex;
}

function locEnd(node) {
  return node.endIndex + 1;
}

module.exports = {
  parsers: {
    html: {
      parse,
      astFormat: "htmlparser2",
      locStart,
      locEnd
    }
  }
};
