/**
 * @typedef {import('unified').Processor} Processor
 */

/**
 * @this {Processor}
 */
function transformFrontMatter() {
  /** @type {any} */
  const data = this.data();

  (data.fromMarkdownExtensions ??= []).push({ transforms: [transform] });
}

const frontMatterTypes = new Set(["yaml", "toml"]);

function transform(node) {
  if (node.children.length === 0) {
    return node;
  }
  const [head, ...rest] = node.children;
  if (!frontMatterTypes.has(head.type)) {
    return node;
  }
  const delimiter = head.type === "yaml" ? "---" : "+++";
  const newHead = {
    ...head,
    type: "front-matter",
    lang: head.type,
    startDelimiter: delimiter,
    endDelimiter: delimiter,
  };
  return {
    ...node,
    children: [newHead, ...rest],
  };
}

export { transformFrontMatter };
