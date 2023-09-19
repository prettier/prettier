import printNumber from "../../utils/print-number.js";
import printString from "../../utils/print-string.js";
import { maybeToLowerCase } from "../utils/index.js";
import CSS_UNITS from "./css-units.evaluate.js";

function printUnit(unit) {
  const lowercased = unit.toLowerCase();
  return CSS_UNITS.has(lowercased) ? CSS_UNITS.get(lowercased) : unit;
}

const STRING_REGEX = /(["'])(?:(?!\1)[^\\]|\\.)*\1/gs;
const NUMBER_REGEX = /(?:\d*\.\d+|\d+\.?)(?:[Ee][+-]?\d+)?/g;
const STANDARD_UNIT_REGEX = /[A-Za-z]+/g;
const WORD_PART_REGEX = /[$@]?[A-Z_a-z\u0080-\uFFFF][\w\u0080-\uFFFF-]*/g;
const ADJUST_NUMBERS_REGEX = new RegExp(
  STRING_REGEX.source +
    "|" +
    `(${WORD_PART_REGEX.source})?` +
    `(${NUMBER_REGEX.source})` +
    `(${STANDARD_UNIT_REGEX.source})?`,
  "g",
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
    (match, quote, wordPart, number, unit) =>
      !wordPart && number
        ? printCssNumber(number) + maybeToLowerCase(unit || "")
        : match,
  );
}

function printCssNumber(rawNumber) {
  return (
    printNumber(rawNumber)
      // Remove trailing `.0`.
      .replace(/\.0(?=$|e)/, "")
  );
}

function shouldPrintTrailingComma(options) {
  return options.trailingComma === "es5" || options.trailingComma === "all";
}

export {
  adjustStrings,
  adjustNumbers,
  quoteAttributeValue,
  shouldPrintTrailingComma,
  printUnit,
  printCssNumber,
};
