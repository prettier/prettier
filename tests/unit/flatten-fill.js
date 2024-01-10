import { fill, softline } from "../../src/document/builders.js";
import { flattenFill } from "../../src/document/utils/flatten-fill.js";

const testCases = [
  [
    "simple case",
    fill(["a", softline, fill(["b", softline, "c"]), softline, "d"]),
    fill([["a"], softline, ["b"], softline, ["c"], softline, ["d"]]),
  ],
];

describe("flatten-fill", () => {
  test.each(testCases)("%# %s", (name, doc, expected) => {
    expect(flattenFill(doc)).toEqual(expected);
  });
});
