import runPrettier from "../run-prettier.js";

describe("preserves shebang", () => {
  runPrettier("cli/with-shebang", ["--end-of-line", "lf", "issue1890.js"]).test(
    {
      status: 0,
    }
  );
});
