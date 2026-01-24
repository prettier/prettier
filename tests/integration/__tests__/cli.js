import fs from "node:fs";
import { prettierCliEntry } from "../env.js";

describe("CLI", () => {
  test("CLI should be executable.", () => {
    expect(() =>
      fs.accessSync(prettierCliEntry, fs.constants.X_OK),
    ).not.toThrow();
  });
});
