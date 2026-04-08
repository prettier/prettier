/**
@import {languages} from "@codemirror/language-data";
@typedef {typeof languages[number]["name"] | "GraphQl"} LanguageNames
*/

// TODO: we should be able to get this from plugin languages
/**
@param {string} parser
@returns {LanguageNames}
*/
function getCodemirrorMode(parser) {
  switch (parser) {
    case "babel":
    case "acorn":
    case "espree":
    case "meriyah":
    case "oxc":
      return "JSX";

    case "doc-explorer":
      return "JavaScript";

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
      return "Handlebars";

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
/** @param {LanguageNames} mode */
async function getLanguageExtension(mode) {
  if (mode === "GraphQl") {
    const { graphql } = await import("cm6-graphql");
    return graphql();
  }

  if (mode === "Handlebars") {
    const { handlebarsLanguage } =
      await import("@xiechao/codemirror-lang-handlebars");
    return handlebarsLanguage;
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
