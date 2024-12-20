import {
  align,
  fill,
  group,
  ifBreak,
  indent,
  line,
  lineSuffix,
} from "../../../src/document/builders.js";
import { cleanDoc } from "../../../src/document/utils.js";

describe("cleanDoc", () => {
  test.each([
    [
      "fill",
      [fill([""]), fill([]), fill(["1"]), fill(["2", line, "3"])],
      [fill(["1"]), fill(["2", line, "3"])],
    ],
    ["nested group", group(group("_")), group("_")],
    [
      "empty group",
      [
        group(""),
        group([""]),
        group("_", { id: "id" }),
        group("_", { shouldBreak: true }),
        group("_", { expandedStates: ["_"] }),
      ],
      [
        group("_", { id: "id" }),
        group("_", { shouldBreak: true }),
        group("_", { expandedStates: ["_"] }),
      ],
    ],
    [
      "removes empty align/indent/line-suffix",
      [
        group([
          align("  ", [""]),
          indent([""]),
          [""],
          "",
          lineSuffix([""]),
          ifBreak("", [""]),
        ]),
        "_",
      ],
      "_",
    ],
    ["removes empty string/", ["", ["", [["", "_", ""], ""]], ""], "_"],
    [
      "concat string & flat concat",
      group([
        group("1"),
        ["2", "3", group("4"), "5", "6"],
        ["7", "8", group("9"), "10", "11"],
      ]),
      group([group("1"), "23", group("4"), "5678", group("9"), "1011"]),
    ],
  ])("%s", (_, doc, expected) => {
    const result = cleanDoc(doc);

    expect(result).toEqual(expected);
  });
});
