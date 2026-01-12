import { Parser as AcornParser } from "acorn";
import { Parser } from "acorn";
import acornJsx from "acorn-jsx";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { fromMarkdown as wikiLinkFromMarkdown } from "mdast-util-wiki-link";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";
import { syntax as wikiLinkSyntax } from "micromark-extension-wiki-link";
import { comment, commentFromMarkdown } from "remark-comment";
import parseFrontMatter from "../../main/front-matter/parse.js";
import { gfmFromMarkdown } from "./micromark/mdast-util-gfm.js";
import { overrideHtmlTextSyntax } from "./micromark/micromark-extension-html-text.js";
import {
  liquidFromMarkdown,
  liquidSyntax,
} from "./micromark/micromark-extension-liquid.js";

let acorn;
const getAcorn = () => {
  acorn ??= AcornParser.extend(acornJsx());
  return acorn;
};

let markdownParseOptions;
function getMarkdownParseOptions() {
  return (markdownParseOptions ??= {
    extensions: [
      gfmSyntax(),
      // mathSyntax(),
      // wikiLinkSyntax(),
      // liquidSyntax(),
      // overrideHtmlTextSyntax(),
      mdxjs({
        acorn: {
          parse(text, options) {
            const comments = [];
            const ast = getAcorn().parse(text, {
              ...options,
              onComment: comments,
            });
            return Object.defineProperty({ ...ast, body: [] }, "raw", {
              value: { ast, text, comments },
            });
          },
          parseExpressionAt(text, position, options) {
            const comments = [];
            const ast = getAcorn().parseExpressionAt(text, position, {
              ...options,
              onComment: comments,
            });
            return Object.defineProperty(
              { type: "Literal", value: 0, start: ast.start, end: ast.end },
              "raw",
              { value: { ast, text, comments } },
            );
          },
        },
      }),
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
