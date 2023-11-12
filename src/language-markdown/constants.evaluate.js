import * as cjkRegex from "cjk-regex";
import unicodeRegex from "unicode-regex";
import escapeStringRegexp from "escape-string-regexp";

const cjkPattern = `(?:${cjkRegex
  .all()
  .union(
    unicodeRegex({
      Script_Extensions: ["Han", "Katakana", "Hiragana", "Hangul", "Bopomofo"],
      General_Category: [
        "Other_Letter",
        "Letter_Number",
        "Other_Symbol",
        "Modifier_Letter",
        "Modifier_Symbol",
        "Nonspacing_Mark",
      ],
    }),
  )
  .toString()})(?:${unicodeRegex({
  Block: ["Variation_Selectors", "Variation_Selectors_Supplement"],
}).toString()})?`;

// http://spec.commonmark.org/0.25/#ascii-punctuation-character
const asciiPunctuationCharacters = [
  "!",
  '"',
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
];

// http://spec.commonmark.org/0.25/#punctuation-character
// https://unicode.org/Public/5.1.0/ucd/UCD.html#General_Category_Values
const unicodePunctuationClasses = [
  /* Pc */ "Connector_Punctuation",
  /* Pd */ "Dash_Punctuation",
  /* Pe */ "Close_Punctuation",
  /* Pf */ "Final_Punctuation",
  /* Pi */ "Initial_Punctuation",
  /* Po */ "Other_Punctuation",
  /* Ps */ "Open_Punctuation",
];

const PUNCTUATION_REGEXP = new RegExp(
  [
    ...asciiPunctuationCharacters.map((character) =>
      escapeStringRegexp(character),
    ),
    ...unicodePunctuationClasses.map(
      (charset) => `\\p{General_Category=${charset}}`,
    ),
  ].join("|"),
  "u",
);

export { cjkPattern, PUNCTUATION_REGEXP };
