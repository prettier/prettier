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
