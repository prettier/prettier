"use strict";

class ConfigError extends Error {}
class DebugError extends Error {}
class UndefinedParserError extends Error {}
class ArgExpansionBailout extends Error {}

module.exports = {
  ConfigError,
  DebugError,
  UndefinedParserError,
  ArgExpansionBailout,
};
