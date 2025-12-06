// There is no way to disable autolink
// We have to rewrite `remark-gfm`
// https://github.com/remarkjs/remark-gfm/issues/16#issuecomment-899046315

// Copied from https://github.com/remarkjs/remark-gfm/blob/main/lib/index.js

/**
 * @import {Root} from 'mdast'
 * @import {Options} from 'remark-gfm'
 * @import {} from 'remark-parse'
 * @import {} from 'remark-stringify'
 * @import {Processor} from 'unified'
 */

import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown, gfmToMarkdown } from "./mdast-util-gfm.js";

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
  const self = /** @type {Processor<Root>} */ (this);
  const settings = options || emptyOptions;
  const data = self.data();

  const micromarkExtensions = (data.micromarkExtensions ||= []);
  const fromMarkdownExtensions = (data.fromMarkdownExtensions ||= []);
  const toMarkdownExtensions = (data.toMarkdownExtensions ||= []);

  micromarkExtensions.push(gfm(settings));
  fromMarkdownExtensions.push(gfmFromMarkdown());
  toMarkdownExtensions.push(gfmToMarkdown(settings));
}
