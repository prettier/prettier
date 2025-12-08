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

import { gfmAutolinkLiteral } from "micromark-extension-gfm-autolink-literal";
import { gfmFootnote } from "micromark-extension-gfm-footnote";
import { gfmStrikethrough } from "micromark-extension-gfm-strikethrough";
import { gfmTable } from "micromark-extension-gfm-table";
import { gfmTaskListItem } from "micromark-extension-gfm-task-list-item";
import { combineExtensions } from "micromark-util-combine-extensions";
import { gfmFromMarkdown, gfmToMarkdown } from "./mdast-util-gfm.js";

/** @type {Options} */
const emptyOptions = {};

/**
 * Add support for GFM (footnotes, strikethrough, tables, tasklists) without
 * autolink literals.
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

  micromarkExtensions.push(
    combineExtensions([
      gfmAutolinkLiteral(),
      gfmFootnote(),
      gfmStrikethrough(settings),
      gfmTable(),
      gfmTaskListItem(),
    ]),
  );
  fromMarkdownExtensions.push(gfmFromMarkdown());
  toMarkdownExtensions.push(gfmToMarkdown(settings));
}
