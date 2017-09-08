"use strict";

function create(detailOptions) {
  return `
Usage: prettier [opts] [filename ...]

Available options:
${indent(
    detailOptions
      .filter(option => !option.isHidden)
      .map(createOptionUsage)
      .join("\n"),
    2
  )}

`.slice(1); // remove leading line break
}

function createOptionUsage(option) {
  const threshold = 25;

  let header = `--${option.name}`;

  if (option.alias) {
    header += ` or -${option.alias}`;
  }

  switch (option.type) {
    case "boolean":
      // do nothing
      break;
    case "choice":
      header += ` <${option.choices
        .filter(choice => !choice.deprecated)
        .map(choice => choice.value)
        .join("|")}>`;
      break;
    default:
      header += ` <${option.type}>`;
      break;
  }

  if (header.length >= threshold) {
    header += "\n" + " ".repeat(threshold);
  } else {
    header += " ".repeat(threshold - header.length);
  }

  return (
    header + option.description.replace(/\n/g, "\n" + " ".repeat(threshold))
  );
}

function indent(str, spaces) {
  return str.replace(/^/gm, " ".repeat(spaces));
}

module.exports = {
  create
};
