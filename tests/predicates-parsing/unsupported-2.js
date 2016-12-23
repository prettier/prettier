// @flow

// Error: no support for checked preds

var a5: (x: mixed) => boolean %checks(x !== null) =
  (y: mixed) => typeof y !== "string";
