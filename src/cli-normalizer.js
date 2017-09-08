"use strict";

function normalizeDetailOptions(detailOptions) {
  const names = Object.keys(detailOptions).sort();

  const normaliezdOptions = names.map(name =>
    Object.assign(
      {
        name,
        _getValue: (value, argv) => {
          const option = detailOptions[name];
          if (value && option.deprecated) {
            let warning = `\`--${name}\` is deprecated.`;
            if (typeof option.deprecated === "string") {
              warning += ` ${option.deprecated}`;
            }
            console.warn(warning);
          }
          if (typeof option.getter === "function") {
            return option.getter(value, argv);
          }
          return value;
        }
      },
      detailOptions[name]
    )
  );

  normaliezdOptions.forEach(normalizedOption => {
    normaliezdOptions[normalizedOption.name] = normalizedOption;
  });

  return normaliezdOptions;
}

function normalizeArgv(argv, detailOptions) {
  const normalizedArgv = { _: argv["_"] };

  detailOptions.forEach(option => {
    Object.defineProperty(normalizedArgv, option.name, {
      get: () => option._getValue(argv[option.name], normalizedArgv)
    });
  });

  return normalizedArgv;
}

module.exports = {
  normalizeArgv,
  normalizeDetailOptions
};
