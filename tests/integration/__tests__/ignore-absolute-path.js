import path from "node:path";

const __dirname = import.meta.dirname;

describe("support absolute filename", () => {
  runCli("cli/ignore-absolute-path", [
    path.resolve(__dirname, "../cli/ignore-absolute-path/ignored/module.js"),
    path.resolve(__dirname, "../cli/ignore-absolute-path/depth1/ignored/*.js"),
    path.resolve(__dirname, "../cli/ignore-absolute-path/regular-module.js"),
    "-l",
  ]).test({
    status: 1,
  });
});
