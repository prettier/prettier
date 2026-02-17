import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { mdxExpression } from "micromark-extension-mdx-expression";
import { mdxJsx } from "micromark-extension-mdx-jsx";
import { mdxMd } from "micromark-extension-mdx-md";
import { mdxjsEsm } from "micromark-extension-mdxjs-esm";
import { fromMarkdown as wikiLinkFromMarkdown } from "mdast-util-wiki-link";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import { syntax as wikiLinkSyntax } from "micromark-extension-wiki-link";
import { comment, commentFromMarkdown } from "remark-comment";
import parseFrontMatter from "../../main/front-matter/parse.js";
import * as acorn from "../acorn/parser.js";
import { gfmFromMarkdown } from "./micromark/mdast-util-gfm.js";
import { overrideHtmlTextSyntax } from "./micromark/micromark-extension-html-text.js";
import {
  liquidFromMarkdown,
  liquidSyntax,
} from "./micromark/micromark-extension-liquid.js";

let markdownParseOptions;
function getMarkdownParseOptions() {
  const settings = {
    acorn,
    acornOptions: { ecmaVersion: 2024, sourceType: "module" },
    addResult: true,
  };
  return (markdownParseOptions ??= {
    extensions: [
      gfmSyntax(),
      // mathSyntax(),
      // wikiLinkSyntax(),
      // liquidSyntax(),
      // overrideHtmlTextSyntax(),
      mdxjsEsm(settings),
      mdxExpression(settings),
      mdxJsx(settings),
      mdxMd(),
      comment,
    ],
    mdastExtensions: [
      gfmFromMarkdown(),
      // mathFromMarkdown(),
      // wikiLinkFromMarkdown(),
      // liquidFromMarkdown(),
      mdxFromMarkdown(),
      commentFromMarkdown({ ast: true }),
    ],
  });
}

function parseMdx(text) {
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

export { parseMdx };
