// There is no way to disable autolink
// Hackly find and replace `gfm-autolink-literal`
// https://github.com/remarkjs/remark-gfm/issues/16#issuecomment-899046315

import { gfmFromMarkdown as originalGfmFromMarkdown } from "mdast-util-gfm";
import * as assert from "#universal/assert";
import { gfmAutolinkLiteralFromMarkdown } from "./gfm-autolink-literal.js";

/**
@import {Extension} from "mdast-util-from-markdown";
*/

/**
@returns {Extension[]}
*/
export function gfmFromMarkdown() {
  const mdastExtensions = originalGfmFromMarkdown();
  const index = mdastExtensions.findIndex((extension) =>
    Boolean(extension.enter.literalAutolink),
  );

  assert.ok(index !== -1);

  mdastExtensions.splice(index, 1, gfmAutolinkLiteralFromMarkdown());

  return mdastExtensions;
}
