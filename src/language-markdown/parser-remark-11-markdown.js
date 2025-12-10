import { fromMarkdown } from "mdast-util-from-markdown";
import { mathFromMarkdown } from "mdast-util-math";
import { fromMarkdown as wikiLinkFromMarkdown } from "mdast-util-wiki-link";
import { gfm as gfmSyntax } from "micromark-extension-gfm";
import { math as mathSyntax } from "micromark-extension-math";
import { syntax as wikiLinkSyntax } from "micromark-extension-wiki-link";
import parseFrontMatter from "../main/front-matter/parse.js";
import { locEnd, locStart } from "./loc.js";
import { gfmFromMarkdown } from "./parser/mdast-util-gfm.js";
import {
  liquidFromMarkdown,
  liquidSyntax,
} from "./parser/micromark-extension-liquid.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";

const parseOptions = {
  extensions: [gfmSyntax(), mathSyntax(), wikiLinkSyntax(), liquidSyntax()],
  mdastExtensions: [
    gfmFromMarkdown(),
    mathFromMarkdown(),
    wikiLinkFromMarkdown(),
    liquidFromMarkdown(),
  ],
};

function parse(text) {
  const { frontMatter, content } = parseFrontMatter(text);
  const ast = fromMarkdown(content, parseOptions);

  if (frontMatter) {
    // @ts-expect-error -- Missing?
    ast.children.unshift(frontMatter);
  }

  return ast;
}

const parser = {
  astFormat: "mdast",
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
  parse,
};

export const remark = parser;
export const markdown = parser;
