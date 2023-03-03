function inferParserByLanguage(options, language) {
  if (!language) {
    return;
  }

  const languages = options.plugins.flatMap((plugin) => plugin.languages ?? []);

  const matched =
    languages.find(({ name }) => name.toLowerCase() === language) ??
    languages.find(({ aliases }) => aliases?.includes(language)) ??
    languages.find(({ extensions }) => extensions?.includes(`.${language}`));
  return matched?.parsers[0];
}

export default inferParserByLanguage;
