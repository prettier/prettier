import { fill, group, join, line } from "../../src/document/builders.js";
import { flattenFill } from "../../src/document/utils/flatten-fill.js";

const testCases = [
  [
    "simple case",
    fill(["a", line, fill(["b", line, "c"]), line, "d"]),
    fill([["a"], line, ["b"], line, ["c"], line, ["d"]]),
  ],
  [
    "nested fill",
    fill([fill(["a", line, fill(["b", line, "c"]), line, "d"]), line, "e"]),
    fill(join(line, [["a"], ["b"], ["c"], ["d"], ["e"]])),
  ],
  [
    "fill in array in fill",
    fill([["a", "b", fill(["c", line, "d"]), "e"], line, "f"]),
    fill(join(line, [["a", "b", "c"], ["d", "e"], ["f"]])),
  ],
  [
    "fill in nested array in fill",
    fill([["a", ["b", fill(["c", line, "d"]), "e"]], line, "f"]),
    fill(join(line, [["a", "b", "c"], ["d", "e"], ["f"]])),
  ],
  [
    "group cannot be flattened",
    fill(["a", line, group(["b", "c", "d"]), line, "d"]),
    fill([["a"], line, [group(["b", "c", "d"])], line, ["d"]]),
  ],
  [
    "doesn't flatten fill in group",
    fill([group(["a", line, fill(["b", line, "c"]), line, "d"])]),
    fill([[group(["a", line, fill(["b", line, "c"]), line, "d"])]]),
  ],
];

describe("flatten-fill", () => {
  test.each(testCases)("%s", (_name, doc, expected) => {
    expect(flattenFill(doc)).toEqual(expected);
  });

  test("throws for non-fill", () => {
    expect(() => flattenFill(group("a"))).toThrow();
  });
});
