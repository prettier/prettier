"use strict";

const path = require("path");
const { UndefinedParserError } = require("../common/errors.js");
const { getSupportInfo } = require("../main/support.js");
const normalizer = require("./options-normalizer.js");
const { resolveParser } = require("./parser.js");

const hiddenDefaults = {
  astFormat: "estree",
  printer: {},
  originalText: undefined,
  locStart: null,
  locEnd: null,
};

// Copy options and fill in default values.
function normalize(options, opts = {}) {
  const rawOptions = { ...options };

  const supportOptions = getSupportInfo({
    plugins: options.plugins,
    showUnreleased: true,
    showDeprecated: true,
  }).options;

  const defaults = {
    ...hiddenDefaults,
    ...Object.fromEntries(
      supportOptions
        .filter((optionInfo) => optionInfo.default !== undefined)
        .map((option) => [option.name, option.default])
    ),
  };
  if (!rawOptions.parser) {
    if (!rawOptions.filepath) {
      const logger = opts.logger || console;
      logger.warn(
        "No parser and no filepath given, using 'babel' the parser now " +
          "but this will throw an error in the future. " +
          "Please specify a parser or a filepath so one can be inferred."
      );
      rawOptions.parser = "babel";
    } else {
      rawOptions.parser = inferParser(rawOptions.filepath, rawOptions.plugins);
      if (!rawOptions.parser) {
        throw new UndefinedParserError(
          `No parser could be inferred for file: ${rawOptions.filepath}`
        );
      }
    }
  }

  const parser = resolveParser(
    normalizer.normalizeApiOptions(
      rawOptions,
      [supportOptions.find((x) => x.name === "parser")],
      { passThrough: true, logger: false }
    )
  );
  rawOptions.astFormat = parser.astFormat;
  rawOptions.locEnd = parser.locEnd;
  rawOptions.locStart = parser.locStart;

  const plugin = getPlugin(rawOptions);
  rawOptions.printer = plugin.printers[rawOptions.astFormat];

  const pluginDefaults = Object.fromEntries(
    supportOptions
      .filter(
        (optionInfo) =>
          optionInfo.pluginDefaults &&
          optionInfo.pluginDefaults[plugin.name] !== undefined
      )
      .map((optionInfo) => [
        optionInfo.name,
        optionInfo.pluginDefaults[plugin.name],
      ])
  );

  const mixedDefaults = { ...defaults, ...pluginDefaults };

  for (const [k, value] of Object.entries(mixedDefaults)) {
    if (rawOptions[k] === null || rawOptions[k] === undefined) {
      rawOptions[k] = value;
    }
  }

  if (rawOptions.parser === "json") {
    rawOptions.trailingComma = "none";
  }

  return normalizer.normalizeApiOptions(rawOptions, supportOptions, {
    passThrough: Object.keys(hiddenDefaults),
    ...opts,
  });
}

function getPlugin(options) {
  const { astFormat } = options;

  // TODO: test this with plugins
  /* istanbul ignore next */
  if (!astFormat) {
    throw new Error("getPlugin() requires astFormat to be set");
  }
  const printerPlugin = options.plugins.find(
    (plugin) => plugin.printers && plugin.printers[astFormat]
  );
  // TODO: test this with plugins
  /* istanbul ignore next */
  if (!printerPlugin) {
    throw new Error(`Couldn't find plugin for AST format "${astFormat}"`);
  }

  return printerPlugin;
}

function inferParser(filepath, plugins) {
  const filename = path.basename(filepath).toLowerCase();
  const languages = getSupportInfo({ plugins }).languages.filter(
    (language) => language.since !== null
  );

  // If the file has no extension, we can try to infer the language from the
  // interpreter in the shebang line, if any; but since this requires FS access,
  // do it last.
  let language = languages.find(
    (language) =>
      (language.extensions &&
        language.extensions.some((extension) =>
          filename.endsWith(extension)
        )) ||
      (language.filenames &&
        language.filenames.some((name) => name.toLowerCase() === filename))
  );

  if (
    process.env.PRETTIER_TARGET !== "universal" &&
    !language &&
    !filename.includes(".")
  ) {
    // `getInterpreter` requires file access, put `require()` in the `if` block,
    // So we can easily remove this part during build
    const getInterpreter = require("../utils/get-interpreter.js");
    const interpreter = getInterpreter(filepath);
    language = languages.find(
      (language) =>
        language.interpreters && language.interpreters.includes(interpreter)
    );
  }

  return language && language.parsers[0];
}

module.exports = { normalize, hiddenDefaults, inferParser };
