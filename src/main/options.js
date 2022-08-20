import path from "node:path";
import { UndefinedParserError } from "../common/errors.js";
import { getSupportInfo } from "../main/support.js";
import {
  createGetVisitorKeysFunction,
  createLocationComparator,
} from "../main/ast/index.js";
import getInterpreter from "../utils/get-interpreter.js";
import { normalizeApiOptions } from "./options-normalizer.js";
import { resolveParser } from "./parser.js";

const hiddenDefaults = {
  astFormat: undefined,
  printer: undefined,
  originalText: undefined,
  locStart: undefined,
  locEnd: undefined,
  getVisitorKeys: undefined,
  locationComparator: undefined,
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
    // @ts-expect-error
    normalizeApiOptions(
      rawOptions,
      [supportOptions.find((x) => x.name === "parser")],
      { passThrough: true, logger: false }
    )
  );
  const { locStart, locEnd, astFormat } = parser;
  rawOptions.astFormat = astFormat;
  rawOptions.locStart = locStart;
  rawOptions.locEnd = locEnd;
  rawOptions.locationComparator = createLocationCompareFunction(
    locStart,
    locEnd
  );

  const plugin = getPlugin(rawOptions);
  const printer = plugin.printers[rawOptions.astFormat];
  rawOptions.printer = printer;
  rawOptions.getVisitorKeys = createGetVisitorKeysFunction(
    printer.getVisitorKeys
  );

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

  console.log({
    rawOptions,
    o: normalizeApiOptions(rawOptions, supportOptions, {
      passThrough: Object.keys(hiddenDefaults),
      ...opts,
    }),
  });

  return normalizeApiOptions(rawOptions, supportOptions, {
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
    const interpreter = getInterpreter(filepath);
    language = languages.find(
      (language) =>
        language.interpreters && language.interpreters.includes(interpreter)
    );
  }

  return language && language.parsers[0];
}

export { normalize, hiddenDefaults, inferParser };
