// There is no way to disable autolink
// Hackly find and replace `gfm-autolink-literal`
// https://github.com/remarkjs/remark-gfm/issues/16#issuecomment-899046315

import { gfmFromMarkdown as originalGfmFromMarkdown } from "mdast-util-gfm";
import * as assert from "#universal/assert";

/**
@import {Extension} from "mdast-util-from-markdown";
*/

/**
@returns {Extension[]}
*/
export function gfmFromMarkdown() {
  const mdastExtensions = originalGfmFromMarkdown();
  const autolinkExtension = mdastExtensions.find((extension) =>
    Boolean(extension.enter.literalAutolink),
  );

  if (process.env.NODE_ENV !== "production") {
    assert.ok(
      autolinkExtension &&
        Array.isArray(autolinkExtension.transforms) &&
        autolinkExtension.transforms.length === 1,
    );
  }

  // Prevent the autolink extension generate nodes without position
  autolinkExtension.transforms = [];

  return mdastExtensions;
}
