"use strict";

const runPrettier = require("../runPrettier");

expect.addSnapshotSerializer(require("../path-serializer"));

describe("supports // @prettier comment", () => {
  runPrettier("cli/", ["--stdin-filepath", "abc.js", "--require-pragma"], {
    input: `/**
 * blah
 */
 // @flow
 // @prettier


 var    foo  =      2
`
  }).test({
    stdout: `/**
 * blah
 */
// @flow
// @prettier

var foo = 2;
`,
    status: 0
  });
});

describe("supports // @prettier comment after hashbang", () => {
  runPrettier("cli/", ["--stdin-filepath", "abc.js", "--require-pragma"], {
    input: `#!/usr/bin/env node
/**
 * blah
 */
 // @flow
 // @prettier


 var    foo  =      2
`
  }).test({
    stdout: `#!/usr/bin/env node
/**
 * blah
 */
// @flow
// @prettier

var foo = 2;
`,
    status: 0
  });
});

describe("supports // @format comment", () => {
  runPrettier("cli/", ["--stdin-filepath", "abc.js", "--require-pragma"], {
    input: `/**
 * blah
 */
 // @flow
 // @format


 var    foo  =      2
`
  }).test({
    stdout: `/**
 * blah
 */
// @flow
// @format

var foo = 2;
`,
    status: 0
  });
});

describe("supports /* @prettier */ comment", () => {
  runPrettier("cli/", ["--stdin-filepath", "abc.js", "--require-pragma"], {
    input: `/**
 * blah
 */
 // @flow
 /* @prettier */


 var    foo  =      2
`
  }).test({
    stdout: `/**
 * blah
 */
// @flow
/* @prettier */

var foo = 2;
`,
    status: 0
  });
});

describe("supports /* @flow @prettier */ comment", () => {
  runPrettier("cli/", ["--stdin-filepath", "abc.js", "--require-pragma"], {
    input: `/**
 * blah
 */
 /* @flow @prettier */


 var    foo  =      2
`
  }).test({
    stdout: `/**
 * blah
 */
/* @flow @prettier */

var foo = 2;
`,
    status: 0
  });
});

describe("ignores non-leading // @prettier comment", () => {
  const input = `/**
 * blah
 */
 // @flow
 "use strict";
 // @prettier


 var    foo  =      2
`;
  runPrettier("cli/", ["--stdin-filepath", "abc.js", "--require-pragma"], {
    input
  }).test({
    stdout: input,
    status: 0
  });
});
