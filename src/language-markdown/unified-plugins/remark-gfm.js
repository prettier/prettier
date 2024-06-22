// https://github.com/remarkjs/remark-gfm/blob/main/lib/index.js

/// <reference types="remark-parse" />
/// <reference types="remark-stringify" />

/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast-util-gfm').Options} MdastOptions
 * @typedef {import('micromark-extension-gfm').Options} MicromarkOptions
 * @typedef {import('unified').Processor<Root>} Processor
 */

/**
 * @typedef {MicromarkOptions & MdastOptions} Options
 *   Configuration.
 */

import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";

import { gfm } from "./micromark-extension-gfm.js";

/** @type {Options} */
const emptyOptions = {};

/**
 * Add support GFM (autolink literals, footnotes, strikethrough, tables,
 * tasklists).
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkGfm(options) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor} */ this;
  const settings = options || emptyOptions;
  const data = self.data();

  const micromarkExtensions = (data.micromarkExtensions ||= []);
  const fromMarkdownExtensions = (data.fromMarkdownExtensions ||= []);
  const toMarkdownExtensions = (data.toMarkdownExtensions ||= []);

  micromarkExtensions.push(gfm(settings));
  fromMarkdownExtensions.push(gfmFromMarkdown());
  toMarkdownExtensions.push(gfmToMarkdown(settings));
}
