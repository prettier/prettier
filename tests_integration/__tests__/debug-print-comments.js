"use strict";

const runPrettier = require("../runPrettier");

describe("prints information for debugging comment attachment with --debug-print-comments", () => {
  runPrettier(
    "cli/with-shebang",
    ["--debug-print-comments", "--parser", "babel"],
    { input: "/* 1 */\nconsole.log(foo /* 2 */); // 3" }
  ).test({
    stderr: "",
    status: 0,
  });
});
