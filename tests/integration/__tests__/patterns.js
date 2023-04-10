describe("multiple patterns", () => {
  runCli("cli/patterns", [
    "directory/**/*.js",
    "other-directory/**/*.js",
    "-l",
  ]).test({
    status: 1,
  });
});

describe("multiple patterns with non exists pattern", () => {
  runCli("cli/patterns", ["directory/**/*.js", "non-existent.js", "-l"]).test({
    status: 2,
  });
});

describe("multiple patterns with ignore nested directories pattern", () => {
  runCli("cli/patterns", ["**/*.js", "!**/nested-directory/**", "-l"]).test({
    status: 1,
  });
});

describe("multiple patterns by with ignore pattern, ignores node_modules by default", () => {
  runCli("cli/patterns", ["**/*.js", "!directory/**", "-l"]).test({
    status: 1,
  });
});

describe("multiple patterns by with ignore pattern, ignores node_modules by with ./**/*.js", () => {
  runCli("cli/patterns", ["./**/*.js", "!./directory/**", "-l"]).test({
    status: 1,
  });
});

describe("multiple patterns by with ignore pattern, doesn't ignore node_modules with --with-node-modules flag", () => {
  runCli("cli/patterns", [
    "**/*.js",
    "!directory/**",
    "-l",
    "--with-node-modules",
  ]).test({
    status: 1,
  });
});

describe("no errors on empty patterns", () => {
  // --parser is mandatory if no filepath is passed
  runCli("cli/patterns", ["--parser", "babel"]).test({
    status: 0,
  });
});

describe("multiple patterns, throw error and exit with non zero code on non existing files", () => {
  runCli("cli/patterns", [
    "non-existent.js",
    "other-non-existent.js",
    "-l",
  ]).test({
    status: 2,
  });
});
