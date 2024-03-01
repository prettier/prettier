/**
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} Handle
 */

/**
 * @param {string} type
 * @returns {FromMarkdownExtension}
 */
function dataNode(type) {
  return {
    canContainEols: [type],
    enter: { [type]: enterInlineMath },
    exit: { [type]: exitInlineMath },
  };

  /** @type {Handle} */
  function enterInlineMath(token) {
    /** @type {any} */
    const node = { type, value: "" };
    this.enter(node, token);
    this.buffer();
  }

  /** @type {Handle} */
  function exitInlineMath(token) {
    const d = this.resume();
    /** @type {any} */
    const node = this.stack.at(-1);
    node.value = d;
    this.exit(token);
  }
}

export { dataNode };
