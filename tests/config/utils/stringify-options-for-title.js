"use strict";

function stringifyOptions(options) {
  const string = JSON.stringify(options || {}, (key, value) =>
    key === "plugins" || key === "errors"
      ? undefined
      : value === Number.POSITIVE_INFINITY
      ? "Infinity"
      : value
  );

  return string === "{}" ? "" : string;
}

module.exports = stringifyOptions;
