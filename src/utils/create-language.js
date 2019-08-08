"use strict";

module.exports = function(linguistData, { extend, override, exclude }) {
  const language = {};

  for (const key in linguistData) {
    const newKey = key === "languageId" ? "linguistLanguageId" : key;
    language[newKey] = linguistData[key];
  }

  if (extend) {
    for (const key in extend) {
      language[key] = (language[key] || []).concat(extend[key]);
    }
  }

  if (exclude) {
    for (const key in exclude) {
      language[key] = (language[key] || []).filter(
        value => (exclude[key] || []).indexOf(value) === -1
      );
    }
  }

  for (const key in override) {
    language[key] = override[key];
  }

  return language;
};
