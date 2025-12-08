// There is no way to disable autolink
// We have to rewrite `remark-gfm`
// https://github.com/remarkjs/remark-gfm/issues/16#issuecomment-899046315

// Copied from https://github.com/remarkjs/remark-gfm/blob/main/lib/index.js

/**
 * @typedef {import('mdast').Root} Root'
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
import { gfmFromMarkdown } from "./mdast-util-gfm.js";

/** @type {Options} */
const emptyOptions = {};

/**
 * Add support for GFM (footnotes, strikethrough, tables, tasklists) without
 * autolink literals.
 *
 * @this {Processor<Root>}
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkGfm(options) {
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = this;
  const settings = options || emptyOptions;
  const data = self.data();

  const micromarkExtensions = (data.micromarkExtensions ||= []);
  const fromMarkdownExtensions = (data.fromMarkdownExtensions ||= []);

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
}
