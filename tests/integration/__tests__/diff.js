"use strict";
const { outdent } = require("outdent");

const runPrettier = require("../run-prettier.js");

describe("checks stdin with --diff", () => {
  runPrettier("cli/with-shebang", ["--diff", "--parser", "babel"], {
    input: "0",
  }).test({
    stdout: outdent({ trimTrailingNewline: false })`
      Index: (stdin)
      ===================================================================
      --- (stdin)
      +++ (stdin)
      @@ -1,1 +1,1 @@
      -0
      \\ No newline at end of file
      +0;

    `,
    stderr: "",
    status: "non-zero",
  });
});

describe("--diff works in CI just as in a non-TTY mode", () => {
  const result0 = runPrettier(
    "cli/write",
    ["--diff", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: true,
      ci: true,
    }
  ).test({
    status: 1,
  });

  const result1 = runPrettier(
    "cli/write",
    ["--diff", "formatted.js", "unformatted.js"],
    {
      stdoutIsTTY: false,
    }
  ).test({
    status: 1,
  });

  test("Should be the same", async () => {
    expect(await result0.stdout).toEqual(await result1.stdout);
  });
});
