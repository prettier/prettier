/* @flow */

/* emitWarning */

process.emitWarning("blah");
process.emitWarning(new Error("blah"));
process.emitWarning("blah", "blah");
process.emitWarning("blah", "blah", () => {});

process.emitWarning(); // error
process.emitWarning(42); // error
process.emitWarning("blah", 42); // error
process.emitWarning("blah", "blah", 42); // error
(process.emitWarning("blah"): string); // error
