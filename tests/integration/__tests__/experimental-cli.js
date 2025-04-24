function runExperimentalCli(args, options) {
  return runCli("cli/experimental-cli", args, {
    ...options,
    env: { ...options?.env, PRETTIER_EXPERIMENTAL_CLI: 1 },
  });
}

describe("experimental cli", () => {
  runExperimentalCli(["--help"]).test({
    status: 0,
    write: [],
    stderr: "",
  });
  runExperimentalCli(["--version"]).test({
    stderr: "",
    status: 0,
    write: [],
  });
  // Stdin format
  runExperimentalCli(["--parser=meriyah"], { input: "foo(   )" }).test({
    stderr: "",
    status: 0,
    write: [],
  });
  // File format
  runExperimentalCli([".", "--write"]).test({
    status: 0,
    write: [],
  });
  runExperimentalCli([".", "--write", "--no-parallel"]).test({
    status: 0,
    write: [],
  });
  // File check
  runExperimentalCli([".", "--check"]).test({
    status: 0,
  });
  runExperimentalCli([".", "--check", "--no-parallel"]).test({
    status: 0,
  });
});
