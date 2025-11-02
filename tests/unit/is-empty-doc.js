import {
  breakParent,
  fill,
  group,
  line,
  lineSuffix,
} from "../../src/document/builders.js";
import { cleanDoc, isEmptyDoc } from "../../src/document/utils.js";

it.each([
  { name: "empty string", doc: "" },
  { name: "non-empty string", doc: "a" },
  { name: "empty array", doc: [] },
  { name: "nested empty array", doc: [[[]]] },
  { name: "array with empty string", doc: [""] },
  { name: "non-empty array", doc: ["", "a", ""] },
  { name: "empty group", doc: group([]) },
  { name: "nested empty group", doc: group([group([])]) },
  { name: "group with empty string", doc: group([""]) },
  { name: "non-empty group", doc: group(["a"]) },
  { name: "empty fill", doc: fill([]) },
  { name: "fill with empty content", doc: fill([["", ""]]) },
  { name: "non-empty fill", doc: fill(["", line]) },
  { name: "empty line", doc: line },
  { name: "empty lineSuffix", doc: lineSuffix([]) },
  { name: "breakParent", doc: breakParent },
])("isEmptyDoc: $name", ({ doc }) => {
  const expected = cleanDoc(doc) === "";
  expect(isEmptyDoc(doc)).toBe(expected);
});
