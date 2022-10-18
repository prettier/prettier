import remarkParse from "remark-parse";
import unified from "unified";
import remarkMath from "remark-math";
import footnotes from "remark-footnotes";
import parseFrontMatter from "../utils/front-matter/parse.js";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";
import { BLOCKS_REGEX, esSyntax } from "./mdx.js";
import htmlToJsx from "./unified-plugins/html-to-jsx.js";
import liquid from "./unified-plugins/liquid.js";
import wikiLink from "./unified-plugins/wiki-link.js";
import looseItems from "./unified-plugins/loose-items.js";
import assert from "assert";

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
  // assert(!isMDX);
  const processor = unified()
    .use(remarkParse, { commonmark: true })
    .use(footnotes)
    .use(remarkMath)
    // .use(isMDX ? esSyntax : identity)
    .use(liquid)
    // .use(isMDX ? htmlToJsx : identity)
    .use(wikiLink);
  // .use(looseItems);

  return async (text) => {
    const { frontMatter, content } = parseFrontMatter(text);
    const ast = await processor.run(processor.parse(content));
    if (frontMatter) {
      ast.children.unshift(frontMatter);
    }
    return ast;
  };
}

function identity(x) {
  return x;
}

const baseParser = {
  astFormat: "mdast",
  hasPragma,
  locStart,
  locEnd,
};

const markdownParser = { ...baseParser, parse: createParse({ isMDX: false }) };

const mdxParser = { ...baseParser, parse: createParse({ isMDX: true }) };

const markdown = {
  parsers: {
    remark: markdownParser,
    markdown: markdownParser,
    mdx: mdxParser,
  },
};

export default markdown;
