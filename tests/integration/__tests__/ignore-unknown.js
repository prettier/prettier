describe("ignore-unknown dir", () => {
  runCli("cli/ignore-unknown", [
    ".",
    "--ignore-unknown",
    "--list-different",
  ]).test({
    status: "non-zero",
    stderr: "",
    write: [],
  });
});

describe("ignore-unknown alias", () => {
  runCli("cli/ignore-unknown", [".", "-u", "--list-different"]).test({
    status: "non-zero",
    stderr: "",
    write: [],
  });
});

describe("ignore-unknown pattern", () => {
  runCli("cli/ignore-unknown", [
    "*",
    "--ignore-unknown",
    "--list-different",
  ]).test({
    status: "non-zero",
    stderr: "",
    write: [],
  });
});

describe("ignore-unknown write", () => {
  runCli("cli/ignore-unknown", [
    ".",
    "--ignore-unknown",
    "--write",
    "--list-different",
  ]).test({
    status: 0,
    stderr: "",
  });
});

describe("ignore-unknown check", () => {
  runCli("cli/ignore-unknown", [".", "--ignore-unknown", "--check"]).test({
    status: 1,
  });
});

describe("None exist file", () => {
  runCli("cli/ignore-unknown", ["non-exist-file", "--ignore-unknown"]).test({
    status: 2,
  });
});

describe("Not matching pattern", () => {
  runCli("cli/ignore-unknown", [
    "*.non-exist-pattern",
    "--ignore-unknown",
  ]).test({
    status: 2,
  });
});

describe("Ignored file", () => {
  runCli("cli/ignore-unknown", ["ignored.js", "--ignore-unknown"]).test({
    status: 0,
  });
});
