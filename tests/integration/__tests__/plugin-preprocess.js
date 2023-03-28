import runPrettier from "../run-prettier.js";
const EOL = "\n";

describe("parser preprocess function is used to reshape input text", () => {
  runPrettier("plugins/preprocess", ["*.foo", "--plugin=./plugin.cjs"], {
    ignoreLineEndings: true,
  }).test({
    stdout: "preprocessed:contents" + EOL,
    stderr: "",
    status: 0,
    write: [],
  });
});
