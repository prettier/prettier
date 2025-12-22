import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { fromMarkdown as wikiLinkFromMarkdown } from "mdast-util-wiki-link";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import { syntax as wikiLinkSyntax } from "micromark-extension-wiki-link";
import parseFrontMatter from "../../main/front-matter/parse.js";
import { gfmFromMarkdown } from "./micromark/mdast-util-gfm.js";
import {
  liquidFromMarkdown,
  liquidSyntax,
} from "./micromark/micromark-extension-liquid.js";

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

export { parseMarkdown };
