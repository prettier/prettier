function assertUniqueArray(array, message) {
  if (new Set(array).size === array.length) {
    return;
  }

  throw new Error(message);
}

function createLanguage(linguistData, getOverrides) {
  const { languageId, ...restData } = linguistData;
  const overrides = getOverrides(linguistData);

  if (process.env.NODE_ENV !== "production" && overrides) {
    for (const property of [
      "parsers",
      "extensions",
      "interpreters",
      "filenames",
    ]) {
      const value = overrides[property];

      if (value) {
        assertUniqueArray(
          value,
          `Language property '${property}' should be unique.`,
        );
      }
    }
  }

  return {
    linguistLanguageId: languageId,
    ...restData,
    ...overrides,
  };
}

export default createLanguage;
