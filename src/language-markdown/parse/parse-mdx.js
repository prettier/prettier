import { fromMarkdown as wikiLinkFromMarkdown } from "@braindb/mdast-util-wiki-link";
import { syntax as wikiLinkSyntax } from "@braindb/micromark-extension-wiki-link";
// https://github.com/leebyron/remark-comment/pull/3
import { comment, commentFromMarkdown } from "@slorber/remark-comment";
import { directiveFromMarkdown } from "mdast-util-directive";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { directive as directiveSyntax } from "micromark-extension-directive";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import { mdxExpression } from "micromark-extension-mdx-expression";
import { mdxJsx } from "micromark-extension-mdx-jsx";
import { mdxMd } from "micromark-extension-mdx-md";
import { mdxjsEsm } from "micromark-extension-mdxjs-esm";
import createError from "../../common/parser-create-error.js";
import parseFrontMatter from "../../main/front-matter/parse.js";
import * as dummyAcorn from "../acorn/dummy-parser.js";
import * as acorn from "../acorn/parser.js";
import { gfmFromMarkdown } from "./micromark/mdast-util-gfm.js";

let markdownParseOptions;
function getMarkdownParseOptions() {
  const settings = {
    acorn,
    acornOptions: {
      /** @type {2024} */ ecmaVersion: 2024,
      /** @type {"module"} */ sourceType: "module",
    },
    addResult: true,
  };
  const esmSettings = {
    ...settings,
    acorn: dummyAcorn,
  };
  return (markdownParseOptions ??= {
    extensions: [
      gfmSyntax(),
      mathSyntax(),
      wikiLinkSyntax({
        // We don't need support alias, use a fake string to bypass
        // https://github.com/stereobooster/braindb/blob/66d6cf74d0bad43f20924a14e382a432ff81cdfa/packages/micromark-extension-wiki-link/src/syntax.ts#L81
        // @ts-expect-error -- expected
        aliasDivider: { charCodeAt: () => Number.NaN },
      }),
      mdxjsEsm(esmSettings),
      mdxExpression(settings),
      mdxJsx(settings),
      mdxMd(),
      directiveSyntax(),
      comment,
    ],
    mdastExtensions: [
      gfmFromMarkdown(),
      mathFromMarkdown(),
      wikiLinkFromMarkdown(),
      mdxFromMarkdown(),
      directiveFromMarkdown(),
      // @ts-expect-error
      commentFromMarkdown({ ast: true }),
    ],
  });
}

function createParseError(error) {
  /* c8 ignore next 9 */
  if (!(
    typeof error?.line === "number" &&
    typeof error?.column === "number" &&
    typeof error?.reason === "string"
  )) {
    return error;
  }

  const { line, column, reason } = error;

  return createError(reason, {
    loc: {
      start: { line, column },
    },
    cause: error,
  });
}

function parseMdx(text) {
  const { frontMatter, content } = parseFrontMatter(text);
  let ast;

  try {
    ast = fromMarkdown(content, getMarkdownParseOptions());
  } catch (error) {
    throw createParseError(error);
  }

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
