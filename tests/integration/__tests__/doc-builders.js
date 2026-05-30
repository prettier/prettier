import prettier from "../../config/prettier-entry.js";
import commonOptions from "../../../src/common/common-options.evaluate.js";
import coreOptions from "../../../src/main/core-options.evaluate.js";

const {
  align,
  breakParent,
  cursor,
  fill,
  group,
  hardline,
  hardlineWithoutBreakParent,
  ifBreak,
  indent,
  join,
  line,
  lineSuffix,
  lineSuffixBoundary,
  literalline,
  literallineWithoutBreakParent,
  softline,
  trim,
} = prettier.doc.builders;

describe("doc builders", () => {
  test.each([
    ["concat", ["1", "2"], ["1", "2"]],
    ["join", join(["1"], ["2", ["3"]]), ["2", ["1"], ["3"]]],
    ["hardline", hardline, [{ type: "line", hard: true }, breakParent]],
    [
      "literalline",
      literalline,
      [{ type: "line", hard: true, literal: true }, breakParent],
    ],
    [
      "group",
      group(["1"]),
      {
        type: "group",
        id: undefined,
        contents: ["1"],
        break: false,
        expandedStates: undefined,
      },
    ],
    ["fill", fill(["1", line, "2"]), { type: "fill", parts: ["1", line, "2"] }],
    [
      "line-suffix",
      lineSuffix(["1"]),
      {
        type: "line-suffix",
        contents: ["1"],
      },
    ],
    [
      "if-break",
      ifBreak(["1"], ["2"]),
      {
        type: "if-break",
        breakContents: ["1"],
        flatContents: ["2"],
        groupId: undefined,
      },
    ],
    [
      "indent",
      indent(["1"]),
      {
        type: "indent",
        contents: ["1"],
      },
    ],
    [
      "align",
      align("  ", ["1"]),
      {
        type: "align",
        contents: ["1"],
        n: "  ",
      },
    ],
  ])("%s", (_, doc, expected) => {
    expect(doc).toStrictEqual(expected);
  });

  test.each([
    ["breakParent", breakParent],
    ["cursor", cursor],
    ["hardline", hardline],
    ["hardlineWithoutBreakParent", hardlineWithoutBreakParent],
    ["line", line],
    ["lineSuffixBoundary", lineSuffixBoundary],
    ["literalline", literalline],
    ["literallineWithoutBreakParent", literallineWithoutBreakParent],
    ["softline", softline],
    ["trim", trim],
  ])("freezes built-in %s docs", (_, doc) => {
    expect(Object.isFrozen(doc)).toBe(true);
  });

  test("freezes built-in options maps", () => {
    expect(Object.isFrozen(coreOptions)).toBe(true);
    expect(Object.isFrozen(commonOptions)).toBe(true);
  });
});
