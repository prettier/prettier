describe("support relative paths", () => {
  runCli("cli/ignore-relative-path", [
    "./shouldNotBeIgnored.js",
    "./α-shouldNotBeIgnored.js",
    "./α-shouldNotBeFormat.js",
    "./level1/level2/level3/shouldNotBeFormat.js",
    "./level1/level2/level3/α-shouldNotBeFormat.js",
    "level1-glob/level2-glob/level3-glob/shouldNotBeFormat.js",
    "level1-glob/level2-glob/level3-glob/α-shouldNotBeFormat.js",
    "./level1-glob/level2-glob/level3-glob/shouldNotBeIgnored.scss",
    "./level1-glob/level2-glob/level3-glob/α-shouldNotBeIgnored.scss",
    "level1-glob/shouldNotBeIgnored.js",
    "level1-glob/α-shouldNotBeIgnored.js",
    "-l",
  ]).test({
    status: 1,
  });
});
