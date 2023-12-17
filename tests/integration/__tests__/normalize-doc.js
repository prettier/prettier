import { fill,group } from "../../../src/document/builders.js";
import { normalizeDoc } from "../../../src/document/utils.js";

describe("normalizeDoc", () => {
  test.each([
    [
      "removes empty strings",
      ["", "foo", fill(["", "bar", ""]), ""],
      ["foo", fill(["bar"])],
    ],
    [
      "flattens nested concat",
      ["foo ", "", ["bar ", "", ["baz", ""]]],
      ["foo bar baz"],
    ],
    [
      "flattens nested concat in other docs",
      group(["foo ", ["bar ", "", ["baz", ""]]]),
      group(["foo bar baz"]),
    ],
    [
      "keeps groups",
      [group("foo"), group("bar"), group("baz")],
      [group("foo"), group("bar"), group("baz")],
    ],
    [
      "keeps fills",
      fill(["foo", fill(["bar", fill(["baz"])])]),
      fill(["foo", fill(["bar", fill(["baz"])])]),
    ],
  ])("%s", (_, doc, expected) => {
    const result = normalizeDoc(doc);

    expect(result).toEqual(expected);
  });
});
