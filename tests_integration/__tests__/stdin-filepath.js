"use strict";

const runPrettier = require("../runPrettier");

test("format correctly if stdin content compatible with stdin-filepath", () => {
  const result = runPrettier(
    "cli",
    ["--stdin-filepath", "abc.css"],
    { input: ".name { display: none; }" } // css
  );

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).toEqual(0);
});

test("throw error if stdin content incompatible with stdin-filepath", () => {
  const result = runPrettier(
    "cli",
    ["--stdin-filepath", "abc.js"],
    { input: ".name { display: none; }" } // css
  );

  expect(result.stdout).toMatchSnapshot();
  expect(result.stderr).toMatchSnapshot();
  expect(result.status).not.toEqual(0);
});
