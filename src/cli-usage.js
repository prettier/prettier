"use strict";

function create(detailOptions) {
  const options = detailOptions.filter(option => !option.hidden);

  const groupedUsages = options.reduce((current, option) => {
    const category = capitalize(option.category || "uncategorized");
    const group = (current[category] = current[category] || []);
    group.push(createOptionUsage(option));
    return current;
  }, {});

  let usage = "Usage: prettier [opts] [filename ...]\n\n";

  usage += Object.keys(groupedUsages)
    .sort()
    .map(category => {
      return `${category} options:\n\n${indent(
        groupedUsages[category].join("\n"),
        2
      )}`;
    })
    .join("\n\n");

  return usage + "\n\n";
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

function capitalize(str) {
  return str.replace(/^[a-z]/, char => char.toUpperCase());
}

function indent(str, spaces) {
  return str.replace(/^/gm, " ".repeat(spaces));
}

module.exports = {
  create
};
