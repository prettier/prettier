// @flow

// variables cannot be annotated with a predicate type

var a3: (x: mixed) => boolean %checks (x !== null);
