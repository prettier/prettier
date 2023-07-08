function createLanguage(
  /** @type {import('linguist-languages').Language}*/ linguistData,
  /** @type {(linguistData: import('linguist-languages').Language) => Partial<import('../index.js').SupportLanguage>}*/ override,
) {
  const { languageId, ...rest } = linguistData;
  return {
    linguistLanguageId: languageId,
    ...rest,
    ...override(linguistData),
  };
}

export default createLanguage;
