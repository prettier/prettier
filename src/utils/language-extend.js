"use strict";

module.exports = function() {
  const main = arguments[0];

  for (let i = 1; i < arguments.length; i++) {
    const arg = arguments[i];
    Object.keys(arg).forEach(key => {
      const newKey = key === "languageId" ? "linguistLanguageId" : key;

      const value = arg[key];
      if (Array.isArray(main[newKey])) {
        main[newKey] = main[newKey].concat(value);
      } else {
        main[newKey] = value;
      }
    });
  }

  return main;
};
