describe("preserves shebang", () => {
  runCli("cli/with-shebang", ["--end-of-line", "lf", "issue1890.js"]).test({
    status: 0,
  });
});

describe.each([
  ["env-split-node-shebang", "#!/usr/bin/env -S node --no-warnings"],
  // cspell:ignore Snode
  ["env-split-attached-node-shebang", "#!/usr/bin/env -Snode --no-warnings"],
  [
    "env-split-long-node-shebang",
    "#!/usr/bin/env --split-string=node --no-warnings",
  ],
])("infers the parser and preserves %s", (file, shebang) => {
  runCli("cli/shebang", [file, "--no-config", "--end-of-line", "lf"]).test({
    status: 0,
    stdout: `${shebang}\nconsole.log(1);`,
    stderr: "",
    write: [],
  });
});

describe.each([
  ["node-shebang", "#!/usr/bin/node"],
  ["env-node-shebang", "#!/usr/bin/env node"],
])("still infers the parser for %s", (file, shebang) => {
  runCli("cli/shebang", [file, "--no-config", "--end-of-line", "lf"]).test({
    status: 0,
    stdout: `${shebang}\n"use strict";`,
    stderr: "",
    write: [],
  });
});
