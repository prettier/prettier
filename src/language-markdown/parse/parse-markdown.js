import { mathFromMarkdown } from "mdast-util-math";
import { fromMarkdown as wikiLinkFromMarkdown } from "mdast-util-wiki-link";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import { syntax as wikiLinkSyntax } from "micromark-extension-wiki-link";
import { htmlBlockNames, htmlRawNames } from "micromark-util-html-tag-name";
import parseFrontMatter from "../../main/front-matter/parse.js";
import { mapAst } from "../utilities.js";
import {
  fromMarkdown,
  htmlFlowHackSyntax,
} from "./micromark/html-flow-hack.js";
import { gfmFromMarkdown } from "./micromark/mdast-util-gfm.js";
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
      wikiLinkSyntax(),
      liquidSyntax(),
      htmlFlowHackSyntax(),
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
  let ast = fromMarkdown(content, getMarkdownParseOptions());

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

  ast = transformInlineHtml(ast);

  return ast;
}

// with html-flow hack, inline HTML can interrupt paragraphs against commonmark spec
// this function merges such inline HTML back into paragraphs
function transformInlineHtml(ast) {
  return mapAst(ast, (node) => {
    if (!node.children) {
      return node;
    }

    const { children } = node;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type !== "html") {
        continue;
      }
      const tagName = child.value
        .match(/^<\/?([a-z0-9-]+)/iu)?.[1]
        .toLowerCase();
      if (!tagName) {
        continue;
      }
      if (
        [...htmlBlockNames].includes(tagName) ||
        htmlRawNames.includes(tagName)
      ) {
        continue;
      }
      const prev = children[i - 1];
      const next = children[i + 1];

      const previousLineDifference =
        prev?.type !== "paragraph"
          ? null
          : child.position.start.line - prev.position.end.line;
      /** @type {"immediate" | "with-new-line" | "none"} */
      const mergePrevious =
        previousLineDifference === null
          ? "none"
          : previousLineDifference === 0
            ? "immediate"
            : previousLineDifference === 1
              ? "with-new-line"
              : "none";

      const nextLineDifference =
        next?.type !== "paragraph"
          ? null
          : next.position.start.line - child.position.end.line;
      /** @type {"immediate" | "with-new-line" | "none"} */
      const mergeNext =
        previousLineDifference === null
          ? "none"
          : nextLineDifference === 0
            ? "immediate"
            : nextLineDifference === 1
              ? "with-new-line"
              : "none";

      if (mergePrevious === "none" && mergeNext === "none") {
        continue;
      }

      if (mergePrevious !== "none") {
        if (mergePrevious === "with-new-line") {
          prev.children.push(newlineTextAfter(prev));
        }
        prev.children.push(child);
        prev.position.end = child.position.end;
        children.splice(i, 1);
        i--;

        if (mergeNext === "none") {
          continue;
        }
        if (mergeNext === "with-new-line") {
          prev.children.push(newlineTextAfter(child));
        }
        prev.children.push(...next.children);
        prev.position.end = next.position.end;
        children.splice(i + 1, 1);
        continue;
      }

      // mergeNext must be not "none" here
      if (mergeNext === "with-new-line") {
        next.children.unshift(newlineTextAfter(child));
      }
      next.children.unshift(child);
      next.position.start = child.position.start;
      children.splice(i, 1);
    }
    return node;
  });

  function newlineTextAfter(node) {
    return {
      type: "newLineHack",
      value: "\n",
      raw: "\n",
      position: {
        start: {
          line: node.position.end.line,
          column: node.position.end.column,
          offset: node.position.end.offset,
        },
        end: {
          line: node.position.end.line + 1,
          column: 1,
          offset: node.position.end.offset + 1,
        },
      },
    };
  }
}

export { parseMarkdown };
