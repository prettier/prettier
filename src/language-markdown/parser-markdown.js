import footnotes from "remark-footnotes";
import gfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

import parseFrontMatter from "../utils/front-matter/parse.js";
import { locEnd, locStart } from "./loc.js";
import { BLOCKS_REGEX, esSyntax } from "./mdx.js";
import { hasPragma } from "./pragma.js";
import frontMatter from "./unified-plugins/front-matter.js";
import htmlToJsx from "./unified-plugins/html-to-jsx.js";
import { remarkLiquid } from "./unified-plugins/liquid-for-micromark.js";
import wikiLink from "./unified-plugins/wiki-link-for-micromark.js";

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
function createParse() {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(gfm)
    .use(remarkLiquid)
    .use(wikiLink);

  return async (text, options) => {
    const { frontMatter, content } = parseFrontMatter(text);
    const ast = await processor.run(processor.parse(content));
    // {console.log(JSON.stringify(ast.children, 0, 2))}

    if (frontMatter) {
      ast.children.unshift(frontMatter);
    }

    return ast;
  };
}

const parser = {
  astFormat: "mdast",
  hasPragma,
  locStart,
  locEnd,
  parse: createParse(),
};

export const remark = parser;
export const markdown = parser;
