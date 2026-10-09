for (const flag of ["--check", "--list-different", "-c", "-l"]) {
  describe(`checks stdin with ${flag}`, () => {
    for (const write of [false, true]) {
      describe(`syntax error${write ? " with --write" : ""}`, () => {
        runCli(
          "cli/syntax-errors",
          [flag, "--parser", "babel", ...(write ? ["--write"] : [])],
          { input: "function foo) {}" },
        ).test({ status: 2, stdout: "", write: [] });
      });
    }

    describe("formatted input", () => {
      runCli("cli/syntax-errors", [flag, "--parser", "babel"], {
        input: "const x = 1;\n",
      }).test({ status: 0, stdout: "", stderr: "", write: [] });
    });

    describe("unformatted input", () => {
      runCli("cli/syntax-errors", [flag, "--parser", "babel"], {
        input: "const x=1",
      }).test({ status: 1, stdout: "(stdin)", stderr: "", write: [] });
    });

    describe("ignored unknown stdin", () => {
      runCli(
        "cli/syntax-errors",
        [flag, "--ignore-unknown", "--stdin-filepath", "x.unknown"],
        { input: "unknown input" },
      ).test({ status: 0, stdout: "", stderr: "", write: [] });
    });

    describe("syntax error is not ignored", () => {
      runCli(
        "cli/syntax-errors",
        [flag, "--ignore-unknown", "--parser", "babel"],
        { input: "function foo) {}" },
      ).test({ status: 2, stdout: "", write: [] });
    });

    describe("file syntax error", () => {
      runCli("cli/syntax-errors", [flag, "invalid-1.js"]).test({
        status: 2,
        write: [],
      });
    });
  });
}
