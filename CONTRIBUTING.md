# Contributing to Prettier

To get up and running, install the dependencies and run the tests:

```bash
yarn
yarn test
```

## Tests

The tests use [Jest snapshots](https://facebook.github.io/jest/docs/en/snapshot-testing.html). You can make changes and run `jest -u` (or `yarn test -u`) to update the snapshots. Then run `git diff` to take a look at what changed. Always update the snapshots when opening a PR.

Each test directory in `tests/format` has a `format.test.js` file that controls how exactly the rest of the files in the directory are used for tests. This file must contain one or more calls to the `runFormatTest` global function. For example, in directories with JavaScript formatting tests, `format.test.js` generally looks like this:

```js
runFormatTest(import.meta, ["babel", "flow", "typescript"]);
```

This verifies that for each file in the directory, the output matches the snapshot and is the same for each listed parser.

You can also pass options as the third argument:

```js
runFormatTest(import.meta, ["babel"], { trailingComma: "es5" });
```

Signature:

```ts
function runFormatTest(
  fixtures:
    | ImportMeta
    | {
        importMeta: ImportMeta;
        snippets?: Array<
          | string
          | { code: string; name?: string; filename?: string; output?: string }
        >;
      },
  parsers: string[],
  options?: PrettierOptions & {
    errors: true | { [parserName: string]: true | string[] };
  },
): void;
```

Parameters:

- **`fixtures`**: Must be set to `import.meta` or to an object of the shape `{ importMeta: import.meta, ... }`. The object may have the `snippets` property to specify an array of extra input entries in addition to the files in the current directory. For each input entry (a file or a snippet), `runFormatTest` configures and runs a number of tests. The main check is that for a given input the output should match the snapshot (for snippets, the expected output can also be specified directly). [Additional checks](#deeper-testing) are controlled by options and environment variables.
- **`parsers`**: A list of parser names. The tests verify that the parsers in this list produce the same output. If the list includes `typescript`, then `babel-ts` is included implicitly. If the list includes `flow`, then `babel-flow` is included implicitly. If the list includes `babel`, and the current directory is inside `tests/format/js` or `tests/format/jsx`, then `acorn`, `espree`, and `meriyah` are included implicitly.
- **`options`**: In addition to Prettier's formatting options, can contain the `errors` property to specify that it's expected that the formatting shouldn't be successful and an error should be thrown for all (`errors: true`) or some combinations of input entries and parsers.

The implementation of `runFormatTest` can be found in [`tests/config/run-format-test.js`](tests/config/run-format-test.js).

`tests/format/flow-repo/` contains the Flow test suite and is not supposed to be edited by hand. To update it, clone the Flow repo next to the Prettier repo and run: `node scripts/sync-flow-tests.cjs ../flow/tests/`.

## Debugging

To debug Prettier locally, you can either debug it in Node (recommended) or the browser.

- The easiest way to debug it in Node is to create a local test file with some example code you want formatted and either run it in an editor like VS Code or run it directly via `./bin/prettier.js <your_test_file>`.
- The easiest way to debug it in the browser is to build Prettier's website locally (see [`website/README.md`](website/README.md)).

## No New Options

Prettier is an opinionated formatter and is not accepting pull requests that add new formatting options. You can [read more about our options philosophy here](docs/option-philosophy.md).

## Pull requests

The project uses ESLint for linting and Prettier for formatting. If your editor isn't set up to work with them, you can lint and format all files from the command line using `yarn fix`.

After opening a PR, describe your changes in a file in the `changelog_unreleased` directory following the template [`changelog_unreleased/TEMPLATE.md`](changelog_unreleased/TEMPLATE.md) and commit this file to your PR. You can use `yarn gen:changelog` to generate a changelog file. Please see comments of the script file for usage.

## Other

Take a look at [`commands.md`](commands.md) and, if you know Haskell, check out [Wadler's paper](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf) to understand how Prettier works.

If you want to know more about Prettier's GitHub labels, see the [Issue Labels](https://github.com/prettier/prettier/wiki/Issue-Labels) page on the Wiki.

# Advanced topics

## Performance

If you're contributing a performance improvement, the following Prettier CLI options can help:

- `--debug-repeat N` uses a naïve loop to repeat the formatting `N` times and measures the average run duration. It can be useful to highlight hot functions in the profiler. This can also set by environment variable `PRETTIER_PERF_REPEAT`.
- `--debug-benchmark` uses [`benchmark`](https://npm.im/benchmark) module to produce statistically significant duration measurements.

For convenience, the following commands for profiling are available via [`package.json`](package.json) `scripts`.

- `PRETTIER_PERF_REPEAT=1000 yarn perf <filename>` starts the naïve loop. See the CLI output for when the measurements finish, and stop profiling at that moment.
- `PRETTIER_PERF_REPEAT=1000 yarn perf:inspect <filename>` starts the naïve loop with `node --inspect-brk` flag that pauses execution and waits for Chromium/Chrome/Node Inspector to attach. Open [`chrome://inspect`](chrome://inspect), select the process to inspect, and activate the CPU Profiler, this will unpause execution. See the CLI output for when the measurements finish, and stop the CPU Profiler at that moment to avoid collecting more data than needed.
- `yarn perf:benchmark <filename>` starts the `benchmark`-powered measurements. See the CLI output for when the measurements finish.

In the above commands:

- `yarn && yarn build` ensures the compiler-optimized version of Prettier is built prior to launching it. Prettier's own environment checks are defaulted to production and removed during the build. The build output is cached, so a rebuild will happen only if the source code changes.
- `NODE_ENV=production` ensures Prettier and its dependencies run in production mode.
- `node --inspect-brk` pauses the script execution until Inspector is connected to the Node process.

In addition to the options above, you can use [`node --prof` and `node --prof-process`](https://nodejs.org/en/docs/guides/simple-profiling/), as well as `node --trace-opt --trace-deopt`, to get more advanced performance insights.

The script [`scripts/benchmark/compare.sh`](scripts/benchmark/compare.sh) can be used to compare performance of two or more commits/branches using [hyperfine](https://github.com/sharkdp/hyperfine). Usage (don't forget to install hyperfine):

```sh
PRETTIER_PERF_FILENAME=my.js ./compare.sh main some-pr-branch
```

Without `PRETTIER_PERF_FILENAME`, the script uses a default JS file as input for Prettier:

```sh
./compare.sh main next
```

## Regression testing

We have a cool tool for regression testing that runs on GitHub Actions. Have a look: https://github.com/prettier/prettier-regression-testing

## Deeper testing

You can run `FULL_TEST=1 jest` for a more robust test run, which includes the following additional checks:

- **compare AST** - re-parses the output and makes sure the new AST is equivalent to the original one.
- **second format** - formats the output again and checks that the second output is the same as the first.
- **EOL '\r\n'** and **EOL '\r'** - check that replacing line endings with `\r\n` or `\r` in the input doesn't affect the output.
- **BOM** - checks that adding BOM (`U+FEFF`) to the input affects the output in only one way: the BOM is preserved.

Usually there is no need to run these extra checks locally, since they're run on the CI anyway.
