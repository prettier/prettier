import { fromMarkdown as wikiLinkFromMarkdown } from "@braindb/mdast-util-wiki-link";
import { syntax as wikiLinkSyntax } from "@braindb/micromark-extension-wiki-link";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import parseFrontMatter from "../../main/front-matter/parse.js";
import { gfmFromMarkdown } from "./micromark/mdast-util-gfm.js";
import { overrideHtmlTextSyntax } from "./micromark/micromark-extension-html-text.js";
import {
  liquidFromMarkdown,
  liquidSyntax,
} from "./micromark/micromark-extension-liquid.js";

let markdownParseOptions;
function getMarkdownParseOptions() {
  return (markdownParseOptions ??= {
    extensions: [
      gfmSyntax(),
      mathSyntax(),
      wikiLinkSyntax({
        // @ts-expect-error -- expected
        aliasDivider: {
          charCodeAt: () => Symbol("aliasDivider"),
        },
      }),
      liquidSyntax(),
      overrideHtmlTextSyntax(),
    ],
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
