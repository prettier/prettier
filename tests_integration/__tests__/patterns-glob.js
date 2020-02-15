"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

/*
fixtures-1/
├─ !file.js
├─ a.js
└─ b.js
*/

describe("fixtures-1: Should match all files", () => {
  runPrettier("cli/patterns-glob/fixtures-1", ["*.js", "!file.js", "-l"]).test({
    status: 1
  });
});

describe("fixtures-1: Should match files except `a.js`", () => {
  runPrettier("cli/patterns-glob/fixtures-1", ["*.js", "!a.js", "-l"]).test({
    status: 1
  });
});

/*
fixtures-2/
├─ a.js
├─ !b.js
└─ !dir.js/
  ├─ 1.css
  └─ 2.css
*/

describe("fixtures-2: Should match all files", () => {
  runPrettier("cli/patterns-glob/fixtures-2", ["*.js", "!dir.js", "-l"]).test({
    status: 1
  });
});

describe("fixtures-2: Should not match any css file", () => {
  runPrettier("cli/patterns-glob/fixtures-2", ["*.js", "!b.js", "-l"]).test({
    status: 1
  });
});

describe("fixtures-2: Should only match `!b.js`", () => {
  runPrettier("cli/patterns-glob/fixtures-2", ["*.js", "!a.js", "-l"]).test({
    status: 1
  });
});

/*
fixtures-3/
├─ outside.js
└─ !dir.js/
  ├─ inside.js
  ├─ node_modules
  │ └─in-node_modules.js
  └─ .svn
    └─in-svn.js
*/

describe("fixtures-3: Should match all files except `.svn/in-svn.js`", () => {
  runPrettier("cli/patterns-glob/fixtures-3", [
    "*.js",
    "!dir.js",
    "-l",
    "--with-node-modules"
  ]).test({
    status: 1
  });
});

describe("fixtures-3: Should exclude `node_modules/in-node_modules.js`", () => {
  runPrettier("cli/patterns-glob/fixtures-3", ["*.js", "!dir.js", "-l"]).test({
    status: 1
  });
});

describe("fixtures-3: Should exclude `.svn`", () => {
  runPrettier("cli/patterns-glob/fixtures-3", ["*.js", ".svn", "-l"]).test({
    status: 1
  });
});

/*
fixtures-4/
├─ inside.js
└─ !outside-dir/
│ └─in-outside-dir.js
└─ cwd
  └─inside.js
*/

describe("fixtures-4: Should not include any file outside cwd", () => {
  runPrettier("cli/patterns-glob/fixtures-4/cwd", [
    "*.js",
    "../!outside.js",
    "../!outside-dir",
    "-l"
  ]).test({
    status: 1
  });
});
