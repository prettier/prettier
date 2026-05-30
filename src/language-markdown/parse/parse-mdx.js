import { htmlTags } from "@prettier/html-tags";
import footnotes from "remark-footnotes";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import htmlBlockElements from "remark-parse/lib/block-elements.js";
import unified from "unified";
import { BLOCKS_REGEX, esSyntax } from "./mdx.js";
import frontMatter from "./unified-plugins/front-matter.js";
import htmlToJsx from "./unified-plugins/html-to-jsx.js";
import liquid from "./unified-plugins/liquid.js";
import wikiLink from "./unified-plugins/wiki-link.js";

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

const htmlBlockElementSet = new Set(htmlBlockElements);
const htmlInlineTagSet = new Set(
  htmlTags.filter((tagName) => !htmlBlockElementSet.has(tagName)),
);
const htmlTagNameStartRegex = /^<\/?\s*([a-z][\w:-]*)/iu;
const inlineHtmlProcessor = unified().use(remarkParse, {
  commonmark: true,
  blocks: [],
});

function startsWithInlineHtmlTag(value) {
  const match = htmlTagNameStartRegex.exec(value);
  return Boolean(match && htmlInlineTagSet.has(match[1].toLowerCase()));
}

function adjustPosition(node, positionStart) {
  if (node.position) {
    for (const key of ["start", "end"]) {
      const point = node.position[key];
      const { line } = point;
      point.line += positionStart.line - 1;
      point.column += line === 1 ? positionStart.column - 1 : 0;
      if (
        typeof point.offset === "number" &&
        typeof positionStart.offset === "number"
      ) {
        point.offset += positionStart.offset;
      }
    }
  }

  for (const child of node.children ?? []) {
    adjustPosition(child, positionStart);
  }

  return node;
}

function parseInlineHtmlChildren(value, positionStart) {
  const [node] = inlineHtmlProcessor.parse(value).children;

  if (!node) {
    return;
  }

  adjustPosition(node, positionStart);

  if (node.type === "paragraph") {
    return node.children;
  }

  if (node.type === "html") {
    return [node];
  }
}

function mergeLineStartInlineHtmlIntoParagraph() {
  return (tree) => {
    const { children } = tree;

    for (let index = 1; index < children.length; index++) {
      const previous = children[index - 1];
      const node = children[index];

      if (
        previous.type !== "paragraph" ||
        node.type !== "jsx" ||
        previous.position?.end?.line + 1 !== node.position?.start?.line ||
        !startsWithInlineHtmlTag(node.value)
      ) {
        continue;
      }

      const inlineChildren = parseInlineHtmlChildren(
        node.value,
        node.position.start,
      );

      if (!inlineChildren) {
        continue;
      }

      previous.children.push(
        {
          type: "text",
          value: "\n",
          position: {
            start: { ...previous.position.end },
            end: { ...node.position.start },
            indent: [1],
          },
        },
        ...inlineChildren,
      );
      previous.position.end = node.position.end;
      children.splice(index, 1);
      index--;
    }
  };
}

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
    .use(mergeLineStartInlineHtmlIntoParagraph)
    .use(wikiLink);
  return processor.run(processor.parse(text));
}

export { parseMdx };
