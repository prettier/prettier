describe("write file with --write + unformatted file", () => {
  runCli("cli/write", ["--write", "unformatted.js"]).test({
    status: 0,
  });
});

describe("write file with -w + unformatted file", () => {
  runCli("cli/write", ["-w", "unformatted.js"]).test({
    status: 0,
  });
});

describe("do not write file with --write + formatted file", () => {
  runCli("cli/write", ["--write", "formatted.js"]).test({
    write: [],
    status: 0,
  });
});

describe("do not write file with --write + invalid file", () => {
  runCli("cli/write", ["--write", "invalid.js"]).test({
    write: [],
    status: "non-zero",
  });
});
