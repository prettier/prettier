"use strict";

const runPrettier = require("../runPrettier");

describe("javascript with shebang", function jsWithShebang() {
    runPrettier("cli/shebang-with-pragma", [ "--require-pragma", "shebang-with-pragma.js"]).test(
        {
            status: 0,
            stdout: //formatted output should match
`#!/usr/bin/env node
/**
 * @format
 */
function test() {
  const answer = 42;
  console.log(\"%s is the answer to life, the universe, and everything\", answer);
}
`
        }
    );
});

