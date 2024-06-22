import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";

import parseFrontMatter from "../utils/front-matter/parse.js";
import { locEnd, locStart } from "./loc.js";
import { hasPragma } from "./pragma.js";
import remarkLiquid from "./unified-plugins/remark-11-liquid.js";

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
    .use(remarkGfm)
    .use(remarkLiquid)
    .use(remarkWikiLink);

  return async (text) => {
    const { frontMatter, content } = parseFrontMatter(text);
    const ast = await processor.run(processor.parse(content));

    if (frontMatter) {
      // @ts-expect-error -- Missing?
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
