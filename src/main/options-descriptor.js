"use strict";

function apiDescriptor(name, value) {
  return arguments.length === 1
    ? JSON.stringify(name)
    : `\`{ ${apiDescriptor(name)}: ${JSON.stringify(value)} }\``;
}

function cliDescriptor(name, value) {
  return value === false
    ? `\`--no-${name}\``
    : value === true || arguments.length === 1
      ? `\`--${name}\``
      : value === ""
        ? `\`--${name}\` without an argument`
        : `\`--${name}=${value}\``;
}

module.exports = {
  apiDescriptor,
  cliDescriptor
};
