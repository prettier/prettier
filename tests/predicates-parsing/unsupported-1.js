// @flow

// (inited) variables cannot be annotated with a predicate type

var a4: (x: mixed) => boolean %checks = (x: mixed) => x !== null;
