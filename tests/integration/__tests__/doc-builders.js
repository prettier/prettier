"use strict";

const prettier = require("prettier-local");
const {
  concat,
  join,
  hardline,
  literalline,
  group,
  fill,
  lineSuffix,
  breakParent,
  ifBreak,
  indent,
  align,
} = prettier.doc.builders;

// TODO: Make these builders to use array if possible in 3.0.0
describe("doc builders", () => {
  test.each([
    ["concat", concat(["1", "2"]), { type: "concat", parts: ["1", "2"] }],
    [
      "join",
      join(concat(["1"]), ["2", concat(["3"])]),
      {
        type: "concat",
        parts: [
          "2",
          { type: "concat", parts: ["1"] },
          { type: "concat", parts: ["3"] },
        ],
      },
    ],
    [
      "join(array)",
      join(["1"], ["2", concat(["3"])]),
      { type: "concat", parts: ["2", ["1"], { type: "concat", parts: ["3"] }] },
    ],
    [
      "hardline",
      hardline,
      { type: "concat", parts: [{ type: "line", hard: true }, breakParent] },
    ],
    [
      "literalline",
      literalline,
      {
        type: "concat",
        parts: [{ type: "line", hard: true, literal: true }, breakParent],
      },
    ],
    [
      "group",
      group(concat(["1"])),
      {
        type: "group",
        id: undefined,
        contents: { type: "concat", parts: ["1"] },
        break: false,
        expandedStates: undefined,
      },
    ],
    [
      "group (array)",
      group(["1"]),
      {
        type: "group",
        id: undefined,
        contents: ["1"],
        break: false,
        expandedStates: undefined,
      },
    ],
    ["fill", fill(["1", "2"]), { type: "fill", parts: ["1", "2"] }],
    [
      "line-suffix",
      lineSuffix(concat(["1"])),
      {
        type: "line-suffix",
        contents: { type: "concat", parts: ["1"] },
      },
    ],
    [
      "line-suffix(array)",
      lineSuffix(["1"]),
      {
        type: "line-suffix",
        contents: ["1"],
      },
    ],
    [
      "if-break",
      ifBreak(concat(["1"]), ["2"]),
      {
        type: "if-break",
        breakContents: { type: "concat", parts: ["1"] },
        flatContents: ["2"],
        groupId: undefined,
      },
    ],
    [
      "indent",
      indent(concat(["1"])),
      {
        type: "indent",
        contents: { type: "concat", parts: ["1"] },
      },
    ],
    [
      "indent(array)",
      indent(["1"]),
      {
        type: "indent",
        contents: ["1"],
      },
    ],
    [
      "align",
      align("  ", concat(["1"])),
      {
        type: "align",
        contents: { type: "concat", parts: ["1"] },
        n: "  ",
      },
    ],
    [
      "align(array)",
      align("  ", ["1"]),
      {
        type: "align",
        contents: ["1"],
        n: "  ",
      },
    ],
  ])("%s", (_, doc, expected) => {
    expect(doc).toEqual(expected);
  });
});
