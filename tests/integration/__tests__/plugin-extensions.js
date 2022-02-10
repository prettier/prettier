import runPrettier from "../run-prettier.js";
const EOL = "\n";

describe("uses 'extensions' from languages to determine parser", () => {
  runPrettier("plugins/extensions", ["*.foo", "--plugin=./plugin.cjs"], {
    ignoreLineEndings: true,
  }).test({
    stdout: "!contents" + EOL,
    stderr: "",
    status: 0,
    write: [],
  });
});
