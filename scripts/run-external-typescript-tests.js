"use strict";

const fs = require("fs");
const globby = require("globby");
const path = require("path");
const format = require("../src/cli-util").format;

function tryFormat(content) {
  try {
    format({ "debug-check": true }, content, { parser: "typescript" });
  } catch (error) {
    return error;
  }
  return null;
}

function runExternalTests(testsDir) {
  const testFiles = globby.sync(path.join(testsDir, "**/*.ts"));

  if (testFiles.length === 0) {
    throw new Error(
      [
        "Couldn't find any test files.",
        `Please make sure that \`${testsDir}\` exists and contains the TypeScript tests.`
      ].join("\n")
    );
  }

  const results = {
    good: [],
    skipped: [],
    bad: []
  };

  testFiles.forEach(file => {
    const content = fs.readFileSync(file, "utf8");

    const error = tryFormat(content);

    if (error instanceof SyntaxError) {
      results.skipped.push({ file, error });
    } else if (error) {
      results.bad.push({ file, error });
    } else {
      results.good.push({ file });
    }

    process.stderr.write(
      `\r${results.good.length} good, ${results.skipped
        .length} skipped, ${results.bad.length} bad`
    );
  });

  return results;
}

function run(argv) {
  if (argv.length !== 1) {
    console.error(
      [
        "You must provide the path to a TypeScript tests directory!",
        "Example: node scripts/run-external-typescript-tests.js ../TypeScript/tests/"
      ].join("\n")
    );
    return 1;
  }

  const testsDir = argv[0];
  let results = null;

  try {
    results = runExternalTests(testsDir);
  } catch (error) {
    console.error(`Failed to run external tests.\n${error}`);
    return 1;
  }

  console.log("");
  console.log(
    results.bad.map(data => `${data.file}\n${data.error}`).join("\n\n\n")
  );

  return 0;
}

if (require.main === module) {
  const exitCode = run(process.argv.slice(2));
  process.exit(exitCode);
}
