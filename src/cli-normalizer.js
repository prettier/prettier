"use strict";

function normalizeDetailOptions(detailOptions) {
  const names = Object.keys(detailOptions).sort();

  const normaliezdOptions = names.map(name => {
    const option = detailOptions[name];
    return Object.assign({}, option, {
      name,
      choices:
        option.choices &&
        option.choices.map(
          choice => (typeof choice === "string" ? { value: choice } : choice)
        ),
      _getValue: (value, argv) => {
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
        if (option.type === "choice") {
          const choice = option.choices.find(choice => choice.value === value);
          if (choice !== undefined && choice.deprecated) {
            const warningValue =
              value === "" ? "without an argument" : `with value \`${value}\``;
            console.warn(
              `\`--${name}\` ${warningValue} is deprecated. Automatically redirect to \`--${name}=${choice.redirect}\`.`
            );
            return choice.redirect;
          }
        }
        return value;
      }
    });
  });

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
