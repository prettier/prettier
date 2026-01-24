import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

describe("Line breaking after filepath with errors", () => {
  runCli("cli/syntax-errors", ["./*.{js,unknown}"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
  runCli("cli/syntax-errors", ["--list-different", "./*.{js,unknown}"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
  runCli("cli/syntax-errors", ["--check", "./*.{js,unknown}"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
  runCli("cli/syntax-errors", ["--write", "./*.{js,unknown}"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
});
