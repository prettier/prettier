"use strict";

function composeOptionsForSnapshot(baseOptions, parsers) {
  const {
    rangeStart,
    rangeEnd,
    cursorOffset,
    disableBabelTS,

    ...snapshotOptions
  } = baseOptions;

  return {
    ...snapshotOptions,
    parsers,
  };
}

module.exports = composeOptionsForSnapshot;
