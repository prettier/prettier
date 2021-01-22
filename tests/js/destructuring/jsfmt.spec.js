// NOTE that multiple parsers are omitted for now to avoid some conflicts when
// testing a private class function with a destructured object argument.
// Keeping the following parsers explicit for now:
// - `espree` (implicitly included when testing `babel` parser)
// - `babel-ts` (implicitly included when testing `typescript` parser)
// XXX TODO add the parsers back once these conflicts are resolved.
run_spec(__dirname, ["espree", "babel-flow", "flow", "babel-ts"]);
