export function fixPrettierVersion(version) {
  const match = version.match(/^\d+\.\d+\.\d+-pr.(\d+)$/u);
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

const astAutoFold = {
  estree: /^\s*"(loc|start|end|tokens|\w+Comments|comments)":/u,
  postcss: /^\s*"(source|input|raws|file)":/u,
  html: /^\s*"(\w+Span|valueTokens|tokens|file|tagDefinition)":/u,
  mdast: /^\s*"position":/u,
  yaml: /^\s*"position":/u,
  glimmer: /^\s*"loc":/u,
  graphql: /^\s*"loc":/u,
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

export function convertSelectionToRange({ head, anchor }, content) {
  const lines = content.split("\n");
  return [head, anchor]
    .map(
      ({ ch, line }) =>
        lines.slice(0, line).join("\n").length + ch + (line ? 1 : 0),
    )
    .sort((a, b) => a - b);
}

export function convertOffsetToSelection(offset, content) {
  let line = 0;
  let ch = 0;
  for (let i = 0; i < offset && i <= content.length; i++) {
    if (content[i] === "\n") {
      line++;
      ch = 0;
    } else {
      ch++;
    }
  }
  return { anchor: { line, ch } };
}
