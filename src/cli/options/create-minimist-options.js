export default function createMinimistOptions(detailedOptions) {
  const booleanNames = [];
  const stringNames = [];
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
      (!option.forwardToApi ||
        name === "plugin" ||
        name === "plugin-search-dir") &&
      option.default !== undefined
    ) {
      let defaultValue = option.default;
      /*
      FIXME:
      This part is not right for "plugin-search-dir" we got `[]`,
      but for "ignore-path" we got `[{value: []}]`.
      Probably because "plugin-search-dir" is an api option
      */
      if (
        Array.isArray(defaultValue) &&
        defaultValue.length === 1 &&
        defaultValue[0].value
      ) {
        defaultValue = defaultValue[0].value;
      }
      defaultValues[option.name] = defaultValue;
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
