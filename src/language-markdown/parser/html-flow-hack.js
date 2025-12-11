/**
Hack this line https://github.com/micromark/micromark/blob/774a70c6bae6dd94486d3385dbd9a0f14550b709/packages/micromark-core-commonmark/dev/lib/html-flow.js#L304
To enforce all html tags parse like `<div>`
https://github.com/remarkjs/remark-gfm/issues/81
*/

import { htmlBlockNames } from "micromark-util-html-tag-name";
import * as assert from "#universal/assert";

if (process.env.NODE_ENV !== "production") {
  assert.ok(Array.isArray(htmlBlockNames));
}

let enabled = false;
const returnTrue = () => true;
const ArrayIncludes = Array.prototype.includes;

Object.defineProperty(htmlBlockNames, "includes", {
  enumerable: false,
  configurable: true,
  get: () => (enabled ? returnTrue : ArrayIncludes),
});

export const enableHtmlFlowHack = () => {
  enabled = true;
};

export const disableHtmlFLowHack = () => {
  enabled = false;
};

if (process.env.NODE_ENV !== "production") {
  assert.equal(htmlBlockNames.includes("div"), true);
  assert.equal(htmlBlockNames.includes("impossible-html-tag"), false);

  enableHtmlFlowHack();

  assert.equal(htmlBlockNames.includes("div"), true);
  assert.equal(htmlBlockNames.includes("impossible-html-tag"), true);

  disableHtmlFLowHack();

  assert.equal(htmlBlockNames.includes("div"), true);
  assert.equal(htmlBlockNames.includes("impossible-html-tag"), false);
}
