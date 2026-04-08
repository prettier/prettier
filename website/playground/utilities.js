export function formatVersion(version) {
  if (version.name === "stable") {
    return {
      text: `v${version.version}`,
      title: `Prettier v${version.version}`,
      link: `https://github.com/prettier/prettier/releases/tag/${version.version}`,
    };
  }

  if (version.name === "next" && version.pr) {
    return {
      text: `PR #${version.pr}`,
      title: `Prettier #${version.pr}`,
      link: `https://github.com/prettier/prettier/pull/${version.pr}`,
    };
  }

  const commit = version.gitTree?.commit;

  return {
    text: commit ?? "uncommitted changes",
    title: `Prettier (${commit ?? "uncommitted"})`,
    link: commit
      ? `https://github.com/prettier/prettier/commit/${commit}`
      : "https://github.com/prettier/prettier/",
  };
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

    if (value === undefined) {
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

const astAutoFold = {
  estree: /^\s*"(loc|start|end|tokens|\w+Comments|comments)":/,
  postcss: /^\s*"(source|input|raws|file)":/,
  html: /^\s*"(\w+Span|valueTokens|tokens|file|tagDefinition)":/,
  mdast: /^\s*"position":/,
  yaml: /^\s*"position":/,
  glimmer: /^\s*"loc":/,
  graphql: /^\s*"loc":/,
};

export function getAstAutoFold(parser) {
  switch (parser) {
    case "flow":
    case "hermes":
    case "babel":
    case "babel-flow":
    case "babel-ts":
    case "typescript":
    case "acorn":
    case "espree":
    case "meriyah":
    case "json":
    case "json5":
    case "json-stringify":
      return astAutoFold.estree;
    case "css":
    case "less":
    case "scss":
      return astAutoFold.postcss;
    case "html":
    case "angular":
    case "vue":
    case "lwc":
    case "mjml":
      return astAutoFold.html;
    case "markdown":
    case "mdx":
      return astAutoFold.mdast;
    case "yaml":
      return astAutoFold.yaml;
    default:
      return astAutoFold[parser];
  }
}
