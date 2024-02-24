/**
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Token} Token
 */

/**
 * @this {Processor}
 */
function remarkEscape() {
  /** @type {any} */
  const data = this.data();

  (data.fromMarkdownExtensions ??= []).push(fromMarkdown());
}

function fromMarkdown() {
  return {
    enter: {
      characterEscape: enter,
      characterEscapeValue: nop,
      escapeMaker: nop,
    },
    exit: {
      characterEscape: exit,
      characterEscapeValue: nop,
      escapeMarker: nop,
    },
  };

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function enter(token) {
    this.enter({ type: "characterEscape" }, token);
  }

  /**
   * @this {CompileContext}
   * @param {Token} token
   */
  function exit(token) {
    const parent = this.stack.at(-1);
    parent.value = this.sliceSerialize(token);
    this.exit(token);
  }

  function nop() {}
}

export { remarkEscape };
