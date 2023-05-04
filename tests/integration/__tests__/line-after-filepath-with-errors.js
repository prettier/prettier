import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

describe("Line breaking after filepath with errors", () => {
  runCli("cli/syntax-errors", ["./*.{js,foo}"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
  runCli("cli/syntax-errors", ["--list-different", "./*.{js,foo}"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
  runCli("cli/syntax-errors", ["--check", "./*.{js,foo}"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
  runCli("cli/syntax-errors", ["--write", "./*.{js,foo}"], {
    stdoutIsTTY: true,
  }).test({ status: 2 });
});
