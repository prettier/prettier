import { all as getCjkCharset } from "cjk-regex";
import { Charset } from "regexp-util";
import unicodeRegex from "unicode-regex";

const cjkCharset = new Charset(
  getCjkCharset(),
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
    // .union below makes the next Block condition "OR"
    // If it is merged into this object definition, it will be "AND" instead
  }).union(
    // Firefox treats some symbols (U+30A0, U+30FB) in the Katakana block as CJK
    unicodeRegex({
      Block: ["Katakana"],
    }),
  ),
);
const variationSelectorsCharset = unicodeRegex({
  Block: ["Variation_Selectors", "Variation_Selectors_Supplement"],
});

const CJK_REGEXP = new RegExp(
  `(?:${cjkCharset.toString("u")})(?:${variationSelectorsCharset.toString("u")})?`,
  "u",
);

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

// https://spec.commonmark.org/0.25/#punctuation-character
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
  `(?:${[
    new Charset(...asciiPunctuationCharacters).toRegExp("u").source,
    ...unicodePunctuationClasses.map(
      (charset) => `\\p{General_Category=${charset}}`,
    ),
  ].join("|")})`,
  "u",
);

export { CJK_REGEXP, PUNCTUATION_REGEXP };
