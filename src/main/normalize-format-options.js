import { UndefinedParserError } from "../common/errors.js";
import { getSupportInfo } from "../main/support.js";
import inferParser from "../utils/infer-parser.js";
import normalizeOptions from "./normalize-options.js";
import {
  getParserPluginByParserName,
  getPrinterPluginByAstFormat,
  initParser,
  initPrinter,
} from "./parser-and-printer.js";

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

  if (!rawOptions.parser) {
    if (!rawOptions.filepath) {
      throw new UndefinedParserError(
        "No parser and no file path given, couldn't infer a parser.",
      );
    } else {
      rawOptions.parser = inferParser(rawOptions, {
        physicalFile: rawOptions.filepath,
      });
      if (!rawOptions.parser) {
        throw new UndefinedParserError(
          `No parser could be inferred for file "${rawOptions.filepath}".`,
        );
      }
    }
  }

  const supportOptions = getSupportInfo({
    plugins: options.plugins,
    showDeprecated: true,
  }).options;

  const defaults = {
    ...formatOptionsHiddenDefaults,
    ...Object.fromEntries(
      supportOptions
        .filter((optionInfo) => optionInfo.default !== undefined)
        .map((option) => [option.name, option.default]),
    ),
  };

  const parserPlugin = getParserPluginByParserName(
    rawOptions.plugins,
    rawOptions.parser,
  );

  const parser = await initParser(parserPlugin, rawOptions.parser);
  rawOptions.astFormat = parser.astFormat;
  rawOptions.locEnd = parser.locEnd;
  rawOptions.locStart = parser.locStart;

  const printerPlugin = parserPlugin.printers?.[parser.astFormat]
    ? parserPlugin
    : getPrinterPluginByAstFormat(rawOptions.plugins, parser.astFormat);
  const printer = await initPrinter(printerPlugin, parser.astFormat);

  rawOptions.printer = printer;

  const pluginDefaults = printerPlugin.defaultOptions
    ? Object.fromEntries(
        Object.entries(printerPlugin.defaultOptions).filter(
          ([, value]) => value !== undefined,
        ),
      )
    : {};

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

export default normalizeFormatOptions;
export { formatOptionsHiddenDefaults };
