"use strict";

function composeOptionsForSnapshot(baseOptions, parsers) {
  const snapshotOptions = { ...baseOptions, parsers };
  const keepRange =
    typeof baseOptions.rangeStart === "number" &&
    typeof baseOptions.rangeEnd === "number";
  if (!keepRange) {
    delete snapshotOptions.rangeStart;
    delete snapshotOptions.rangeEnd;
  }
  delete snapshotOptions.cursorOffset;
  delete snapshotOptions.disableBabelTS;
  return snapshotOptions;
}

module.exports = composeOptionsForSnapshot;
