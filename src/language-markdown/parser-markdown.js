"use strict";

const remarkParse = require("remark-parse");
const unified = require("unified");
const remarkMath = require("remark-math");
const footnotes = require("remark-footnotes");
const pragma = require("./pragma.js");
const { locStart, locEnd } = require("./loc.js");
const mdx = require("./mdx.js");
const htmlToJsx = require("./unified-plugins/html-to-jsx.js");
const frontMatter = require("./unified-plugins/front-matter.js");
const liquid = require("./unified-plugins/liquid.js");
const wikiLink = require("./unified-plugins/wiki-link.js");
const looseItems = require("./unified-plugins/loose-items.js");

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
