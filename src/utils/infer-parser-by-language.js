import { getSupportInfo } from "../main/support.js";

function inferParserByLanguage(language, options) {
  const { languages } = getSupportInfo({ plugins: options.plugins });
  const matched =
    languages.find(({ name }) => name.toLowerCase() === language) ||
    languages.find(
      ({ aliases }) => Array.isArray(aliases) && aliases.includes(language)
    ) ||
    languages.find(
      ({ extensions }) =>
        Array.isArray(extensions) && extensions.includes(`.${language}`)
    );
  return matched && matched.parsers[0];
}

export default inferParserByLanguage;
