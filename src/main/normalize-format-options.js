import { UndefinedParserError } from "../common/errors.js";
import { getSupportInfo } from "../main/support.js";
import inferParser from "../utils/infer-parser.js";
import normalizeOptions from "./normalize-options.js";
import { resolveParser } from "./parser.js";

const formatOptionsHiddenDefaults = {
  astFormat: "estree",
  printer: {},
  originalText: undefined,
  locStart: null,
  locEnd: null,
};

// Copy options and fill in default values.
async function normalizeFormatOptions(options, opts = {}) {
  const rawOptions = { ...options };

  const supportOptions = getSupportInfo({
    plugins: options.plugins,
    showDeprecated: true,
  }).options;

  const defaults = {
    ...formatOptionsHiddenDefaults,
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
      rawOptions.parser = inferParser(rawOptions, {
        physicalFile: rawOptions.filepath,
      });
      if (!rawOptions.parser) {
        throw new UndefinedParserError(
          `No parser could be inferred for file "${rawOptions.filepath}".`
        );
      }
    }
  }
  const parser = await resolveParser(
    // @ts-expect-error
    normalizeOptions(
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
        (optionInfo) => optionInfo.pluginDefaults?.[plugin.name] !== undefined
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

  return normalizeOptions(rawOptions, supportOptions, {
    passThrough: Object.keys(formatOptionsHiddenDefaults),
    ...opts,
  });
}

function getPlugin(options) {
  const { astFormat } = options;

  // TODO: test this with plugins
  /* c8 ignore next 3 */
  if (!astFormat) {
    throw new Error("getPlugin() requires astFormat to be set");
  }
  const printerPlugin = options.plugins.find(
    (plugin) => plugin.printers?.[astFormat]
  );
  // TODO: test this with plugins
  /* c8 ignore next 3 */
  if (!printerPlugin) {
    throw new Error(`Couldn't find plugin for AST format "${astFormat}"`);
  }

  return printerPlugin;
}

export default normalizeFormatOptions;
export { formatOptionsHiddenDefaults };
