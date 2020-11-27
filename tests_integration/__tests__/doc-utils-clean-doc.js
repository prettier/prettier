"use strict";

const prettier = require("prettier-local");
const docBuilders = prettier.doc.builders;
const docUtils = prettier.doc.utils;

const { cleanDoc } = docUtils;
const { group, concat, align, indent, lineSuffix, ifBreak } = docBuilders;

describe("cleanDoc", () => {
  test.each([
    [
      "removes empty align/indent/group/line-suffix",
      concat([
        group(
          concat([
            align("  ", concat([""])),
            indent(concat([""])),
            concat([""]),
            "",
            lineSuffix(concat([""])),
            ifBreak("", concat([""])),
          ])
        ),
        "_",
      ]),
      "_",
    ],
    [
      "removes empty string/concat",
      concat(["", concat(["", concat([concat(["", "_", ""]), ""])]), ""]),
      "_",
    ],
    ["concat string/concat simple", concat(["1", concat(["2", "3"])]), "123"],
    [
      "concat string/concat 1",
      concat([
        group("1"),
        concat(["2", "3", group("4"), "5", "6"]),
        concat(["7", "8", group("9"), "10", "11"]),
      ]),
      concat([
        group("1"),
        concat(["23", group("4"), "5678", group("9"), "1011"]),
      ]),
    ],
  ])("%s", (_, doc, expected) => {
    const result = cleanDoc(doc);

    expect(result).toEqual(expected);
  });
});
