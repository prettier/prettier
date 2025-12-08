// Based on `mdast-util-gfm-autolink-literal` (MIT):
// https://github.com/syntax-tree/mdast-util-gfm-autolink-literal/blob/ba83f42e2d6e7bafbb213b2bf94ec533891a6d82/lib/index.js
// Vendored to keep behavior stable and add position preservation for fallback transforms.

/**
 * @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-from-markdown').Transform} FromMarkdownTransform
 */

/**
 * Create an extension for `mdast-util-from-markdown` to enable GFM autolink
 * literals in markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
 */
export function gfmAutolinkLiteralFromMarkdown() {
  return {
    transforms: [transformGfmAutolinkLiterals],
    enter: {
      literalAutolink: enterLiteralAutolink,
      literalAutolinkEmail: enterLiteralAutolinkValue,
      literalAutolinkHttp: enterLiteralAutolinkValue,
      literalAutolinkWww: enterLiteralAutolinkValue,
    },
    exit: {
      literalAutolink: exitLiteralAutolink,
      literalAutolinkEmail: exitLiteralAutolinkEmail,
      literalAutolinkHttp: exitLiteralAutolinkHttp,
      literalAutolinkWww: exitLiteralAutolinkWww,
    },
  };
}

// to-markdown part is removed because it's not needed in our use case
// export function gfmAutolinkLiteralToMarkdown() {}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterLiteralAutolink(token) {
  this.enter({ type: "link", title: null, url: "", children: [] }, token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterLiteralAutolinkValue(token) {
  this.config.enter.autolinkProtocol.call(this, token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkHttp(token) {
  this.config.exit.autolinkProtocol.call(this, token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkWww(token) {
  this.config.exit.data.call(this, token);
  const node = this.stack.at(-1);
  assert(node.type === "link");
  node.url = "http://" + this.sliceSerialize(token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkEmail(token) {
  this.config.exit.autolinkEmail.call(this, token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolink(token) {
  this.exit(token);
}

/**
 * Removed from `mdast-util-gfm-autolink-literal` to preserve positions.
 *
 * @type {FromMarkdownTransform}
 */
function transformGfmAutolinkLiterals(tree) {
  return tree;
}

/**
 * Simple assertion function.
 *
 * @param {*} condition
 * @returns {asserts condition}
 * @throws {Error}
 */
function assert(condition) {
  if (!condition) {
    throw new Error("Assertion failed");
  }
}
