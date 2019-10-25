export function fixPrettierVersion(version) {
  const match = version.match(/^\d+\.\d+\.\d+-pr.(\d+)$/);
  if (match) {
    return `pr-${match[1]}`;
  }
  return version;
}

export function getDefaults(availableOptions, optionNames) {
  const defaults = {};
  for (const option of availableOptions) {
    if (optionNames.includes(option.name)) {
      defaults[option.name] =
        option.name === "parser" ? "babel" : option.default;
    }
  }
  return defaults;
}

export function buildCliArgs(availableOptions, options) {
  const args = [];
  for (const option of availableOptions) {
    const value = options[option.name];

    if (typeof value === "undefined") {
      continue;
    }

    if (option.type === "boolean") {
      if ((value && !option.inverted) || (!value && option.inverted)) {
        args.push([option.cliName, true]);
      }
    } else if (value !== option.default || option.name === "rangeStart") {
      args.push([option.cliName, value]);
    }
  }
  return args;
}

export function getCodemirrorMode(parser) {
  switch (parser) {
    case "css":
    case "less":
    case "scss":
      return "css";
    case "graphql":
      return "graphql";
    case "markdown":
      return "markdown";
    default:
      return "jsx";
  }
}
