import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import jestPathSerializer from "../path-serializer.js";

expect.addSnapshotSerializer(jestPathSerializer);

describe("ignores file name contains emoji", () => {
  runCli("cli/special-characters-in-path/ignore-emoji", ["**/*.js", "-l"]).test(
    {
      status: 1,
    },
  );
});

describe("stdin", () => {
  runCli(
    "cli/special-characters-in-path/ignore-emoji",
    ["--stdin-filepath", "ignored/我的样式.css"],
    {
      input: ".name {                         display: none; }",
    },
  ).test({
    status: 0,
  });
});

describe("square-brackets-and-dash", () => {
  runCli("cli/special-characters-in-path/square-brackets-and-dash", [
    "test",
  ]).test({});
});

if (path.sep === "/") {
  const directory = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    "../cli/special-characters-in-path/quotes",
  );

  fs.rmSync(directory, { force: true, recursive: true });
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    path.join(directory, '".js'),
    "function add(){ return 1 + 2 }",
  );
  afterAll(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  describe("quotes", () => {
    runCli("cli/special-characters-in-path/quotes", ["**/*.js"]).test({
      status: 0,
      stdout: "function add() {\n  return 1 + 2;\n}",
      stderr: "",
      write: [],
    });
  });
}
