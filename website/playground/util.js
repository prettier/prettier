export function fixPrettierVersion(version) {
  const match = version.match(/^\d+\.\d+\.\d+-pr.(\d+)$/);
  if (match) {
    return `pr-${match[1]}`;
  }
  return version;
}

export function getDefaults(availableOptions, enabledOptions) {
  return availableOptions.reduce((acc, option) => {
    if (enabledOptions.includes(option.name)) {
      acc[option.name] = option.default;
    }
    return acc;
  }, {});
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
