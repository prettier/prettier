import footnotes from "remark-footnotes";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import unified from "unified";
import { BLOCKS_REGEX, esSyntax } from "./mdx.js";
import frontMatter from "./unified-plugins/front-matter.js";
import htmlToJsx from "./unified-plugins/html-to-jsx.js";
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
      .use(isMDX ? esSyntax : noop)
      .use(liquid)
      .use(isMDX ? htmlToJsx : noop)
      .use(wikiLink);
    return processor.run(processor.parse(text));
  };
}

function noop() {}

const parseMarkdown = /* @__PURE__ */ createParse({ isMDX: false });
const parseMdx = /* @__PURE__ */ createParse({ isMDX: true });

export { parseMarkdown, parseMdx };
