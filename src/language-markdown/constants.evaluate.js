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
  }),
);
const variationSelectorsCharset = unicodeRegex({
  Block: ["Variation_Selectors", "Variation_Selectors_Supplement"],
});

const CJK_REGEXP = new RegExp(
  `(?:${cjkCharset.toString()})(?:${variationSelectorsCharset.toString()})?`,
);

// http://spec.commonmark.org/0.25/#ascii-punctuation-character
const asciiPunctuationCharset =
  /* prettier-ignore */ new Charset(
  "!", '"', "#",  "$", "%", "&", "'", "(", ")", "*",
  "+", ",", "-",  ".", "/", ":", ";", "<", "=", ">",
  "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|",
  "}", "~"
);

// http://spec.commonmark.org/0.25/#punctuation-character
const unicodePunctuationCharset = unicodeRegex({
  // http://unicode.org/Public/5.1.0/ucd/UCD.html#General_Category_Values
  General_Category: [
    /* Pc */ "Connector_Punctuation",
    /* Pd */ "Dash_Punctuation",
    /* Pe */ "Close_Punctuation",
    /* Pf */ "Final_Punctuation",
    /* Pi */ "Initial_Punctuation",
    /* Po */ "Other_Punctuation",
    /* Ps */ "Open_Punctuation",
  ],
});

const PUNCTUATION_REGEXP = new Charset(
  asciiPunctuationCharset,
  unicodePunctuationCharset,
).toRegExp();

export { CJK_REGEXP, PUNCTUATION_REGEXP };
