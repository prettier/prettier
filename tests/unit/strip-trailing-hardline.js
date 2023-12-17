import { fill,hardline } from "../../src/document/builders.js";
import { stripTrailingHardline } from "../../src/document/utils.js";

test("Should not mutate doc", () => {
  {
    const original = fill(["text", [hardline]]);
    expect(stripTrailingHardline(original)).toStrictEqual(fill(["text", []]));
    expect(original.parts.length).toBe(2);
  }

  {
    const original = ["text", [hardline]];
    expect(stripTrailingHardline(original)).toStrictEqual(["text"]);
    expect(original.length).toBe(2);
  }
});

test("Should work for strings", () => {
  expect(stripTrailingHardline("\ntext\n\n\r\r\r\n\r\n")).toBe("\ntext");
});
