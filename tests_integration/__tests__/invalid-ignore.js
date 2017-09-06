"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../cwd-serializer"));

test("throw error with invalid ignore", () => {
  const result = runPrettier("cli/invalid-ignore", ["something.js"]);

  expect(result.stderr).toMatchSnapshot();
  expect(result.status).not.toEqual(0);
});
