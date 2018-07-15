# Contributing to Prettier

To get up and running, install the dependencies and run the tests:

```bash
yarn
yarn lint
yarn test
```

Here's what you need to know about the tests:

- The tests use [Jest snapshots](https://facebook.github.io/jest/docs/en/snapshot-testing.html).
- You can make changes and run `jest -u` (or `yarn test -u`) to update the snapshots. Then run `git diff` to take a look at what changed. Always update the snapshots when opening a PR.
- You can run `AST_COMPARE=1 jest` for a more robust test run. That formats each file, re-parses it, and compares the new AST with the original one and makes sure they are semantically equivalent.
- Each test folder has a `jsfmt.spec.js` that runs the tests. For JavaScript files, generally you can just put `run_spec(__dirname, ["babylon", "flow", "typescript"]);` there. This will verify that the output using each parser is the same. You can also pass options as the third argument, like this: `run_spec(__dirname, ["babylon"], { trailingComma: "es5" });`
- `tests/flow/` contains the Flow test suite, and is not supposed to be edited by hand. To update it, clone the Flow repo next to the Prettier repo and run: `node scripts/sync-flow-tests.js ../flow/tests/`.
- If you would like to debug prettier locally, you can either debug it in node or the browser. The easiest way to debug it in the browser is to run the interactive `docs` REPL locally. The easiest way to debug it in node, is to create a local test file and run it in an editor like VS Code.

Run `yarn lint --fix` to automatically format files.

If you can, take look at [commands.md](commands.md) and check out [Wadler's paper](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf) to understand how Prettier works.

If you want to know more about Prettier's GitHub labels, see the [Issue Labels](https://github.com/prettier/prettier/wiki/Issue-Labels) page on the Wiki.

## Performance

If you're contributing a performance improvement, the following Prettier CLI options can help:

- `--debug-benchmark` uses [`benchmark`](https://npm.im/benchmark) module to produce statistically significant time measurements. The measurements are printed at the debug log level, use `--loglevel debug` to see them.
- `--debug-repeat N` uses a naive loop to repeat the formatting `N` times and measures the average run time. It can be useful to highlight hot functions in the profiler. The measurements are printed at the debug log level, use `--loglevel debug` to see them.

To run Prettier with the profiler, use the Node CLI `--inspect-brk` option and Chromium/Chrome browser's [`chrome://inspect`](chrome://inspect) page to activate the Chrome DevTools Profiler for Node:

```
$ cat FileToFormat.js | NODE_ENV=production node --inspect-brk ./bin/prettier.js --stdin-filepath FileToFormat.js --debug-repeat 1000 --loglevel debug > /dev/null
```

In the above command:

- `cat FileToFormat.js |` ensures the file contents are read from the filesystem by a separate program, not Prettier CLI.
- `NODE_ENV=production` ensures Prettier runs without internal development checks.
- `node --inspect-brk` pauses the script execution until Chrome DevTools are connected to the Node process.
- `--stdin-filepath FileToFormat.js` ensures the file format of the `stdin` input is deduced correctly (in this example it's JavaScript).
- `--debug-repeat 1000` tells Prettier CLI to run the formatting 1000 times.
- `--loglevel debug` ensures the `--debug-repeat` measurements are printed to `stderr`.
- `> /dev/null` ensures the formatted output is discarded.

You can also use [`node --prof` and `node --prof-process`](https://nodejs.org/en/docs/guides/simple-profiling/), as well as `node --trace-opt --trace-deopt`, for more advanced performance insights.
