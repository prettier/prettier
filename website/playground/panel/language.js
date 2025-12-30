// TODO: we should be able to get this from plugin languages
function getCodemirrorMode(parser) {
  switch (parser) {
    case "babel":
    case "acorn":
    case "espree":
    case "meriyah":
    case "oxc":
    case "doc-explorer":
      return "JSX";

    case "flow":
    case "babel-flow":
    case "babel-ts":
    case "typescript":
    case "hermes":
    case "oxc-ts":
      return "TSX";

    case "css":
      return "CSS";
    case "less":
      return "LESS";
    case "scss":
      return "SCSS";

    case "graphql":
      return "GraphQl";

    case "json":
    case "json5":
    case "jsonc":
    case "json-stringify":
      return "JSON";

    case "vue":
      return "Vue";

    case "yaml":
      return "YAML";

    case "glimmer":
    case "html":
    case "mjml":
    case "lwc":
      return "HTML";

    case "angular":
      return "Angular Template";
    case "markdown":
    case "mdx":
      return "Markdown";
  }
  return "TSX";
}

let languageExtensions;
async function getLanguageExtension(mode) {
  if (mode === "GraphQl") {
    const { graphql } = await import("cm6-graphql");
    return graphql();
  }

  if (!languageExtensions) {
    const { languages } = await import("@codemirror/language-data");
    languageExtensions = new Map(
      languages.map((language) => [language.name, language]),
    );
  }

  const language =
    languageExtensions.get(mode) ?? languageExtensions.get("TSX");
  return await language.loadFunc();
}

export { getCodemirrorMode, getLanguageExtension };
