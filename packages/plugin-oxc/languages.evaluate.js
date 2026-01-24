import builtinJsLanguages from "../../src/language-js/languages.evaluate.js";

const replacements = new Map([
  ["babel", "oxc"],
  ["typescript", "oxc-ts"],
]);

const languages = builtinJsLanguages
  .map((language) => {
    const parsers = language.parsers
      .map((parser) => replacements.get(parser))
      .filter(Boolean);

    return parsers.length > 0 ? { ...language, parsers } : undefined;
  })
  .filter(Boolean);

export default languages;
