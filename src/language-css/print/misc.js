import printNumber from "../../utils/print-number.js";
import printString from "../../utils/print-string.js";
import CSS_UNITS from "./css-units.evaluate.js";

function printUnit(unit) {
  const lowercased = unit.toLowerCase();
  return CSS_UNITS.has(lowercased) ? CSS_UNITS.get(lowercased) : unit;
}

const STRING_REGEX = /(["'])(?:(?!\1)[^\\]|\\.)*\1/gsu;
const NUMBER_REGEX = /(?:\d*\.\d+|\d+\.?)(?:e[+-]?\d+)?/giu;
const STANDARD_UNIT_REGEX = /[a-z]+/giu;
const WORD_PART_REGEX = /[$@]?[_a-z\u0080-\uFFFF][\w\u0080-\uFFFF-]*/giu;
const ADJUST_NUMBERS_REGEX = new RegExp(
  STRING_REGEX.source +
    "|" +
    // eslint-disable-next-line regexp/no-misleading-capturing-group
    `(${WORD_PART_REGEX.source})?` +
    `(${NUMBER_REGEX.source})` +
    `(${STANDARD_UNIT_REGEX.source})?`,
  "giu",
);

function adjustStrings(value, options) {
  return value.replaceAll(STRING_REGEX, (match) => printString(match, options));
}

function quoteAttributeValue(value, options) {
  const quote = options.singleQuote ? "'" : '"';
  return value.includes('"') || value.includes("'")
    ? value
    : quote + value + quote;
}

function adjustNumbers(value) {
  return value.replaceAll(
    ADJUST_NUMBERS_REGEX,
    (match, quote, wordPart, number, unit) => {
      if (!wordPart && number) {
        unit ??= "";
        unit = unit.toLowerCase();

        if (
          !unit ||
          // `2n + 1`
          unit === "n" ||
          CSS_UNITS.has(unit)
        ) {
          return printCssNumber(number) + (unit ? printUnit(unit) : "");
        }
      }

      return match;
    },
  );
}

function printCssNumber(rawNumber) {
  return (
    printNumber(rawNumber)
      // Remove trailing `.0`.
      .replace(/\.0(?=$|e)/u, "")
  );
}

function shouldPrintTrailingComma(options) {
  return options.trailingComma === "es5" || options.trailingComma === "all";
}

export {
  adjustNumbers,
  adjustStrings,
  printCssNumber,
  printUnit,
  quoteAttributeValue,
  shouldPrintTrailingComma,
};
