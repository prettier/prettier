"use strict";

function normalizeDetailOptions(detailOptions) {
  const names = Object.keys(detailOptions).sort();

  const normaliezdOptions = names.map(name =>
    Object.assign({ name }, detailOptions[name])
  );

  normaliezdOptions.forEach(normalizedOption => {
    normaliezdOptions[normalizedOption.name] = normalizedOption;
  });

  return normaliezdOptions;
}

module.exports = {
  normalizeDetailOptions
};
