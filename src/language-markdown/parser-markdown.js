import remarkParse from "remark-parse";
import unified from "unified";
import remarkMath from "remark-math";
import footnotes from "remark-footnotes";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";
import { BLOCKS_REGEX, esSyntax } from "./mdx.js";
import htmlToJsx from "./unified-plugins/html-to-jsx.js";
import frontMatter from "./unified-plugins/front-matter.js";
import liquid from "./unified-plugins/liquid.js";
import wikiLink from "./unified-plugins/wiki-link.js";
import looseItems from "./unified-plugins/loose-items.js";

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
        ...(isMDX && { blocks: [BLOCKS_REGEX] }),
      })
      .use(footnotes)
      .use(frontMatter)
      .use(remarkMath)
      .use(isMDX ? esSyntax : identity)
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
