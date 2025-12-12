import { mathFromMarkdown } from "mdast-util-math";
import { fromMarkdown as wikiLinkFromMarkdown } from "mdast-util-wiki-link";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import { syntax as wikiLinkSyntax } from "micromark-extension-wiki-link";
import footnotes from "remark-footnotes";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import unified from "unified";
import parseFrontMatter from "../main/front-matter/parse.js";
import { locEnd, locStart } from "./loc.js";
import { BLOCKS_REGEX, esSyntax } from "./mdx.js";
import { fromMarkdown } from "./parser/html-flow-hack.js";
import { gfmFromMarkdown } from "./parser/mdast-util-gfm.js";
import {
  liquidFromMarkdown,
  liquidSyntax,
} from "./parser/micromark-extension-liquid.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";
import frontMatter from "./unified-plugins/front-matter.js";
import htmlToJsx from "./unified-plugins/html-to-jsx.js";
import liquid from "./unified-plugins/liquid.js";
import wikiLink from "./unified-plugins/wiki-link.js";

let markdownParseOptions;
function getMarkdownParseOptions() {
  return (markdownParseOptions ??= {
    extensions: [gfmSyntax(), mathSyntax(), wikiLinkSyntax(), liquidSyntax()],
    mdastExtensions: [
      gfmFromMarkdown(),
      mathFromMarkdown(),
      wikiLinkFromMarkdown(),
      liquidFromMarkdown(),
    ],
  });
}

function parseMarkdown(text) {
  const { frontMatter, content } = parseFrontMatter(text);
  const ast = fromMarkdown(content, getMarkdownParseOptions());

  if (frontMatter) {
    const [start, end] = [frontMatter.start, frontMatter.end].map(
      ({ line, column, index }) => ({
        line,
        column: column + 1,
        offset: index,
      }),
    );

    ast.children.unshift({
      ...frontMatter,
      // @ts-expect-error -- Expected
      type: "frontMatter",
      position: { start, end },
    });
  }

  return ast;
}

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

function parseMdx(text) {
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
}

const baseParser = {
  astFormat: "mdast",
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
};

export const markdown = { ...baseParser, parse: parseMarkdown };
export const mdx = { ...baseParser, parse: parseMdx };
export { markdown as remark };
