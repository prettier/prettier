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

describe("fixtures-2: Should match all js files", () => {
  runPrettier("cli/patterns-glob/fixtures-2", ["*.js", "!dir.js", "-l"]).test({
    status: 1
  });
});

describe("fixtures-2: Should match `a.js` and `!b.js`", () => {
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
└─ dir
  ├─ inside.js
  ├─ node_modules/
  │ └─in-node_modules.js
  └─ .svn/
    └─in-svn.js
*/

describe("fixtures-3: Should match `outside.js`, `dir/inside.js` and `dir/node_modules/in-node_modules.js`", () => {
  runPrettier("cli/patterns-glob/fixtures-3", [
    "**/*.js",
    "-l",
    "--with-node-modules"
  ]).test({
    status: 1
  });
});

describe("fixtures-3: Should only match `outside.js` and `dir/inside.js`", () => {
  runPrettier("cli/patterns-glob/fixtures-3", ["**/*.js", "-l"]).test({
    status: 1
  });
});

describe("fixtures-3: Should exclude `.svn`", () => {
  runPrettier("cli/patterns-glob/fixtures-3", [
    "*.js",
    ".svn/in-svn.js",
    "-l"
  ]).test({
    status: 1
  });
});
