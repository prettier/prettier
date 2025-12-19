/**
Hack this line https://github.com/micromark/micromark/blob/774a70c6bae6dd94486d3385dbd9a0f14550b709/packages/micromark-core-commonmark/dev/lib/html-flow.js#L304
To enforce all html tags parse like `<div>`
https://github.com/remarkjs/remark-gfm/issues/81
*/
import { fromMarkdown as originalFromMarkdown } from "mdast-util-from-markdown";
import { htmlFlow } from "micromark-core-commonmark";
import { htmlBlockNames, htmlRawNames } from "micromark-util-html-tag-name";
import { codes } from "micromark-util-symbol";
import * as assert from "#universal/assert";

const isProduction = process.env.NODE_ENV !== "production";

if (!isProduction) {
  assert.ok(Array.isArray(htmlBlockNames));
}

let htmlRawNamesSet;
const treatEverythingExceptRawNamesAsBlock = (tagName) => {
  htmlRawNamesSet ??= new Set(htmlRawNames);
  return !htmlRawNamesSet.has(tagName);
};

let fromMarkdown = originalFromMarkdown;
if (isProduction) {
  // In production, the array is bundled, it's fine to override
  Object.defineProperty(htmlBlockNames, "includes", {
    enumerable: false,
    configurable: true,
    get: () => treatEverythingExceptRawNamesAsBlock,
  });
} else {
  let enabled = false;
  const ArrayIncludes = Array.prototype.includes;
  Object.defineProperty(htmlBlockNames, "includes", {
    enumerable: false,
    configurable: true,
    get: () => (enabled ? treatEverythingExceptRawNamesAsBlock : ArrayIncludes),
  });

  fromMarkdown = function (...arguments_) {
    enabled = true;

    try {
      // @ts-expect-error -- Safe
      return originalFromMarkdown(...arguments_);
    } finally {
      enabled = false;
    }
  };
}

// interrupt html-text by html-flow to hack html tags in paragraphs
function htmlFlowHackSyntax() {
  return {
    text: {
      [codes.lessThan]: {
        ...htmlFlow,
        add: "before",
      },
    },
  };
}

export { fromMarkdown, htmlFlowHackSyntax };
