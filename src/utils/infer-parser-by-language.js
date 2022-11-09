import { getSupportInfo } from "../main/support.js";

function inferParserByLanguage(language, options) {
  const { languages } = getSupportInfo({ plugins: options.plugins });
  const matched =
    languages.find(({ name }) => name.toLowerCase() === language) ??
    languages.find(({ aliases }) => aliases?.includes(language)) ??
    languages.find(({ extensions }) => extensions?.includes(`.${language}`));
  return matched?.parsers[0];
}

export default inferParserByLanguage;
