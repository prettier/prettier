run_spec(__dirname, ["flow"]);
// FIXME nbsp.js flow != babylon output, waiting for: https://github.com/babel/babylon/pull/344
run_spec(__dirname, ["babylon"]);
