import path from "node:path";
import createEsmUtils from "esm-utils";
const { __dirname } = createEsmUtils(import.meta);

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
