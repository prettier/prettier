"use strict";

function composeOptionsForSnapshot(baseOptions, parsers) {
  const {
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
