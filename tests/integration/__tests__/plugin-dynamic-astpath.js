"use strict";

const runPrettier = require("../run-prettier.js");
const EOL = "\n";

describe("an dynamically-generated AstPath can be used for printing", () => {
  runPrettier("plugins/dynamic-astpath", ["*.foo", "--plugin=./plugin"], {
    ignoreLineEndings: true,
  }).test({
    stdout: "<foo>\n  <bar>\n    the,bar,string\n  </bar>\n  <baz>the; baz; string</baz>\n</foo>" + EOL,
    stderr: "",
    status: 0,
    write: [],
  });
});
