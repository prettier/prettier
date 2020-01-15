"use strict";

const fs = require("fs");
const globby = require("globby");
const { format } = require("../src/cli-util");

function tryFormat(file) {
  const content = fs.readFileSync(file, "utf8");

  try {
    format({ "debug-check": true }, content, {
      // Allow specifying the parser via an environment variable:
      parser: process.env.PARSER,
      // Use file extension detection otherwise:
      filepath: file
    });
  } catch (error) {
    return error;
  }
  return null;
}

function runExternalTests(patterns) {
  const testFiles = globby.sync(patterns);

  if (testFiles.length === 0) {
    throw new Error(`No matching files. Patterns tried: ${patterns.join(" ")}`);
  }

  const results = {
    good: [],
    skipped: [],
    bad: []
  };

  testFiles.forEach(file => {
    const error = tryFormat(file);

    if (error instanceof SyntaxError) {
      results.skipped.push({ file, error });
    } else if (error) {
      results.bad.push({ file, error });
    } else {
      results.good.push({ file });
    }

    process.stderr.write(
      `\r${results.good.length} good, ${results.skipped.length} skipped, ${results.bad.length} bad`
    );
  });

  return results;
}

function run(argv) {
  if (argv.length === 0) {
    console.error(
      [
        "You must provide at least one file or glob for test files!",
        "Examples:",
        '  node scripts/run-external-tests.js "../TypeScript/tests/**/*.ts"',
        '  node scripts/run-external-tests.js "../flow/tests/**/*.js"',
        '  PARSER=flow node scripts/run-external-tests.js "../flow/tests/**/*.js"'
      ].join("\n")
    );
    return 1;
  }

  let results = null;

  try {
    results = runExternalTests(argv);
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
