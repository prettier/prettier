"use strict";

function composeOptionsForSnapshot(baseOptions, parsers) {
  const {
    disableBabelTS,
    plugins,
    filepath,
    parser,

    ...snapshotOptions
  } = baseOptions;

  return {
    ...snapshotOptions,
    parsers,
  };
}

module.exports = composeOptionsForSnapshot;
