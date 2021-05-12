"use strict";

const remarkParse = require("remark-parse");
const unified = require("unified");
const remarkMath = require("remark-math");
const footnotes = require("remark-footnotes");
const parseFrontMatter = require("../utils/front-matter/parse");
const pragma = require("./pragma");
const { locStart, locEnd } = require("./loc");
const { mapAst, INLINE_NODE_WRAPPER_TYPES } = require("./utils");
const mdx = require("./mdx");

/**
 * based on [MDAST](https://github.com/syntax-tree/mdast) with following modifications:
 *
 * 1. restore unescaped character (Text)
 * 2. merge continuous Texts
 * 3. replace whitespaces in InlineCode#value with one whitespace
 *    reference: http://spec.commonmark.org/0.25/#example-605
 * 4. split Text into Sentence
 *
 * interface Word { value: string }
 * interface Whitespace { value: string }
 * interface Sentence { children: Array<Word | Whitespace> }
 * interface InlineCode { children: Array<Sentence> }
 */
function createParse({ isMDX }) {
  return (text) => {
    const processor = unified()
      .use(remarkParse, {
        commonmark: true,
        ...(isMDX && { blocks: [mdx.BLOCKS_REGEX] }),
      })
      .use(footnotes)
      .use(frontMatter)
      .use(remarkMath)
      .use(isMDX ? mdx.esSyntax : identity)
      .use(liquid)
      .use(isMDX ? htmlToJsx : identity)
      .use(wikiLink)
      .use(looseItems);
    return processor.runSync(processor.parse(text));
  };
}

function identity(x) {
  return x;
}

function htmlToJsx() {
  return (ast) =>
    mapAst(ast, (node, _index, [parent]) => {
      if (
        node.type !== "html" ||
        mdx.COMMENT_REGEX.test(node.value) ||
        INLINE_NODE_WRAPPER_TYPES.includes(parent.type)
      ) {
        return node;
      }

      return { ...node, type: "jsx" };
    });
}

function frontMatter() {
  const proto = this.Parser.prototype;
  proto.blockMethods = ["frontMatter", ...proto.blockMethods];
  proto.blockTokenizers.frontMatter = tokenizer;

  function tokenizer(eat, value) {
    const parsed = parseFrontMatter(value);

    if (parsed.frontMatter) {
      return eat(parsed.frontMatter.raw)(parsed.frontMatter);
    }
  }
  tokenizer.onlyAtStart = true;
}

function liquid() {
  const proto = this.Parser.prototype;
  const methods = proto.inlineMethods;
  methods.splice(methods.indexOf("text"), 0, "liquid");
  proto.inlineTokenizers.liquid = tokenizer;

  function tokenizer(eat, value) {
    const match = value.match(/^({%.*?%}|{{.*?}})/s);

    if (match) {
      return eat(match[0])({
        type: "liquidNode",
        value: match[0],
      });
    }
  }
  tokenizer.locator = function (value, fromIndex) {
    return value.indexOf("{", fromIndex);
  };
}

function wikiLink() {
  const entityType = "wikiLink";
  const wikiLinkRegex = /^\[\[(?<linkContents>.+?)]]/s;
  const proto = this.Parser.prototype;
  const methods = proto.inlineMethods;
  methods.splice(methods.indexOf("link"), 0, entityType);
  proto.inlineTokenizers.wikiLink = tokenizer;

  function tokenizer(eat, value) {
    const match = wikiLinkRegex.exec(value);

    if (match) {
      const linkContents = match.groups.linkContents.trim();

      return eat(match[0])({
        type: entityType,
        value: linkContents,
      });
    }
  }

  tokenizer.locator = function (value, fromIndex) {
    return value.indexOf("[", fromIndex);
  };
}

function looseItems() {
  const proto = this.Parser.prototype;
  const originalList = proto.blockTokenizers.list;

  function fixListNodes(value, node, parent) {
    if (node.type === "listItem") {
      node.loose = node.spread || value.charAt(value.length - 1) === "\n";
      if (node.loose) {
        parent.loose = true;
      }
    }
    return node;
  }

  proto.blockTokenizers.list = function list(realEat, value, silent) {
    function eat(subvalue) {
      const realAdd = realEat(subvalue);

      function add(node, parent) {
        return realAdd(fixListNodes(subvalue, node, parent), parent);
      }
      add.reset = function (node, parent) {
        return realAdd.reset(fixListNodes(subvalue, node, parent), parent);
      };

      return add;
    }
    eat.now = realEat.now;
    return originalList.call(this, eat, value, silent);
  };
}

const baseParser = {
  astFormat: "mdast",
  hasPragma: pragma.hasPragma,
  locStart,
  locEnd,
};

const markdownParser = { ...baseParser, parse: createParse({ isMDX: false }) };

const mdxParser = { ...baseParser, parse: createParse({ isMDX: true }) };

module.exports = {
  parsers: {
    remark: markdownParser,
    markdown: markdownParser,
    mdx: mdxParser,
  },
};
