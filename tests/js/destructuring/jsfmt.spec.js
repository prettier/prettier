// NOTE that `babel` & `typescript` parsers are left out for now
// to avoid a conflict with testing private class functions.
// XXX TODO add `babel` & `typescript` parsers back
// once the issue with private functions & destructured objects
// is resolved
run_spec(__dirname, ["babel-flow", "flow", "babel-ts"]);
