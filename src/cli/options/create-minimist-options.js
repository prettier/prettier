export default function createMinimistOptions(detailedOptions) {
  const booleanNames = [];
  // Numeric-looking arguments will be returned as numbers unless opts.string or opts.boolean contains that argument name.
  // To disable numeric conversion for non-option arguments, add '_' to opts.string.
  // https://github.com/minimistjs/minimist#const-argv--parseargsargs-opts
  const stringNames = ["_"];
  const defaultValues = {};

  for (const option of detailedOptions) {
    const { name, alias, type } = option;
    const names = type === "boolean" ? booleanNames : stringNames;
    names.push(name);
    if (alias) {
      names.push(alias);
    }

    if (
      !option.deprecated &&
      (!option.forwardToApi || name === "plugin") &&
      option.default !== undefined
    ) {
      defaultValues[option.name] = option.default;
    }
  }

  return {
    // we use vnopts' AliasSchema to handle aliases for better error messages
    alias: {},
    boolean: booleanNames,
    string: stringNames,
    default: defaultValues,
  };
}
