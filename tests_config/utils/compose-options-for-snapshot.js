"use strict";

function composeOptionsForSnapshot(baseOptions, parsers) {
  const {
    rangeStart,
    rangeEnd,
    cursorOffset,
    disableBabelTS,
    plugins,
    filepath,
    parser,
    errors,

    ...snapshotOptions
  } = baseOptions;

  return {
    ...snapshotOptions,
    parsers,
  };
}

module.exports = composeOptionsForSnapshot;
