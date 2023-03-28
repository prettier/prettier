function createLanguage(linguistData, override) {
  const { languageId, ...rest } = linguistData;
  return {
    linguistLanguageId: languageId,
    ...rest,
    ...override(linguistData),
  };
}

export default createLanguage;
