"use strict";

module.exports = function(linguistData, transform) {
  const language = {};

  for (const key in linguistData) {
    const newKey = key === "languageId" ? "linguistLanguageId" : key;
    language[newKey] = linguistData[key];
  }

  return transform(language);
};
