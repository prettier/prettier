import { frontmatter } from "micromark-extension-frontmatter";

import parseFrontMatter from "../../utils/front-matter/parse.js";

/**
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Token} Token
 */

function remarkFrontMatter(options, text) {
  /** @type {any} */
  const data = this.data();

  (data.micromarkExtensions ??= []).push(frontmatter(options));
  (data.fromMarkdownExtensions ??= []).push(fromMarkdown(text));
}

function fromMarkdown(text) {
  return {
    enter: { yaml: enterFrontMatter, toml: enterFrontMatter },
    exit: { yaml: exitFrontMatter, toml: exitFrontMatter },
    transforms: [
      function (node) {
        if (node.children.length === 0) {
          return node;
        }
        const [head, ...rest] = node.children;
        if (head.type !== "front-matter") {
          return node;
        }
        const fm = parseFrontMatter(
          text.slice(head.position.start.offset, head.position.end.offset),
        );
        const newHead = {
          ...head,
          ...fm.frontMatter,
        };
        return {
          ...node,
          children: [newHead, ...rest],
        };
      },
    ],
  };

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function enterFrontMatter(token) {
    this.enter({ type: "front-matter" }, token);
  }

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function exitFrontMatter(token) {
    this.exit(token);
  }
}

export { remarkFrontMatter };
