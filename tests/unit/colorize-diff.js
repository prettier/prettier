import { colorizeDiff } from "../../src/cli/format.js";
import { picocolorsStderr } from "../../src/cli/logger.js";
import { picocolors } from "../../src/cli/prettier-internal.js";

const patch = [
  "Index: file.js",
  "===================================================================",
  "--- file.js",
  "+++ file.js",
  "@@ -1,2 +1,2 @@",
  "-var x      =      1;",
  "+var x = 1;",
  "",
].join("\n");

const fakeColors = {
  green: (text) => `<green>${text}</green>`,
  red: (text) => `<red>${text}</red>`,
};

test("colorizeDiff colors +/- lines with the given colors", () => {
  expect(colorizeDiff(patch, fakeColors)).toBe(
    [
      "Index: file.js",
      "===================================================================",
      "--- file.js",
      "+++ file.js",
      "@@ -1,2 +1,2 @@",
      "<red>-var x      =      1;</red>",
      "<green>+var x = 1;</green>",
      "",
    ].join("\n"),
  );
});

test("colorizeDiff leaves headers and context lines alone", () => {
  const text = "--- a\n+++ b\n@@ -1 +1 @@\n context";

  expect(colorizeDiff(text, fakeColors)).toBe(text);
});

test("colorizeDiff uses the stdout colors by default", () => {
  expect(colorizeDiff(patch)).toBe(colorizeDiff(patch, picocolors));
});

test("stderr colors are a separate instance from the stdout colors", () => {
  expect(picocolorsStderr).not.toBe(picocolors);
});
