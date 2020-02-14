"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

/*
fixtures-1/
├─ !file.js
├─ a.js
└─ b.mjs
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
  runPrettier("cli/patterns-glob/fixtures-2", ["**.js", "!dir.js", "-l"]).test({
    status: 1
  });
});

describe("fixtures-2: Should not match any css file", () => {
  runPrettier("cli/patterns-glob/fixtures-2", ["**.js", "!b.js", "-l"]).test({
    status: 1
  });
});

describe("fixtures-2: Should only match `!b.js`", () => {
  runPrettier("cli/patterns-glob/fixtures-2", ["**.js", "!a.js", "-l"]).test({
    status: 1
  });
});
