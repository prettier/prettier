// `flow-parser` doesn't fully support optional chaining.
// See https://github.com/facebook/flow/issues/8159
// TODO: delete this folder and enable "flow" in `tests/optional_chaining` when that issue is fixed.
run_spec(__dirname, ["babel-flow", "flow"]);
