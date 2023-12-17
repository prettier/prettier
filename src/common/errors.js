class ConfigError extends Error {
  name = "ConfigError";
}

class UndefinedParserError extends Error {
  name = "UndefinedParserError";
}

class ArgExpansionBailout extends Error {
  name = "ArgExpansionBailout";
}

export { ArgExpansionBailout,ConfigError, UndefinedParserError };
