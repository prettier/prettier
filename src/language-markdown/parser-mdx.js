import remarkParse from "remark-parse-v8";
import unified from "unified-v9";
import remarkMath from "remark-math-v3";
import footnotes from "remark-footnotes";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";
import { BLOCKS_REGEX, esSyntax } from "./mdx.js";
import htmlToJsx from "./unified-plugins/html-to-jsx.js";
import frontMatter from "./unified-plugins/front-matter.js";
import liquid from "./unified-plugins/liquid.js";
import wikiLink from "./unified-plugins/wiki-link.js";

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

const mdxParser = {
  astFormat: "mdast",
  hasPragma,
  locStart,
  locEnd,
  parse(text) {
    const processor = unified()
      .use(remarkParse, {
        commonmark: true,
        blocks: [BLOCKS_REGEX],
      })
      .use(footnotes)
      .use(frontMatter)
      .use(remarkMath)
      .use(esSyntax)
      .use(liquid)
      .use(htmlToJsx)
      .use(wikiLink);
    return processor.run(processor.parse(text));
  },
};


export const mdx = mdxParser;
