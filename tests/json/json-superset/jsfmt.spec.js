const LINE_SEPARATOR = "\u2028";
const PARAGRAPH_SEPARATOR = "\u2029";
const SPACE = " ";
const LINE_FEED = "\n";
const UNDERSCORE = "_";
const BACKSLASH = "\\";
const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';

const characters = [LINE_SEPARATOR, PARAGRAPH_SEPARATOR, UNDERSCORE, SPACE];
const characterCode = (character) =>
  `U+${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`;

run_spec(
  {
    dirname: __dirname,
    snippets: [
      ...characters.map((character) => ({
        name: `json(${characterCode(character)})`,
        code: SINGLE_QUOTE + character + SINGLE_QUOTE,
        output: DOUBLE_QUOTE + character + DOUBLE_QUOTE + LINE_FEED,
      })),
      ...[...characters, LINE_FEED].map((character) => ({
        name: `json(\\${characterCode(character)})`,
        code: SINGLE_QUOTE + BACKSLASH + character + SINGLE_QUOTE,
        output:
          character === UNDERSCORE || character === SPACE
            ? DOUBLE_QUOTE + character + DOUBLE_QUOTE + LINE_FEED
            : DOUBLE_QUOTE + BACKSLASH + character + DOUBLE_QUOTE + LINE_FEED,
      })),
      ...characters.map((character) => ({
        name: `json(\\\\${characterCode(character)})`,
        code: SINGLE_QUOTE + BACKSLASH + BACKSLASH + character + SINGLE_QUOTE,
        output:
          DOUBLE_QUOTE +
          BACKSLASH +
          BACKSLASH +
          character +
          DOUBLE_QUOTE +
          LINE_FEED,
      })),
    ],
  },
  ["json", "json5"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: [
      ...characters.map((character) => ({
        name: `json-stringify(${characterCode(character)})`,
        code: SINGLE_QUOTE + character + SINGLE_QUOTE,
        output: DOUBLE_QUOTE + character + DOUBLE_QUOTE + LINE_FEED,
      })),
      ...[...characters, LINE_FEED].map((character) => ({
        name: `json-stringify(\\${characterCode(character)})`,
        code: SINGLE_QUOTE + BACKSLASH + character + SINGLE_QUOTE,
        output:
          character === UNDERSCORE || character === SPACE
            ? DOUBLE_QUOTE + character + DOUBLE_QUOTE + LINE_FEED
            : DOUBLE_QUOTE + DOUBLE_QUOTE + LINE_FEED,
      })),
      ...characters.map((character) => ({
        name: `json-stringify(\\\\${characterCode(character)})`,
        code: SINGLE_QUOTE + BACKSLASH + BACKSLASH + character + SINGLE_QUOTE,
        output:
          DOUBLE_QUOTE +
          BACKSLASH +
          BACKSLASH +
          character +
          DOUBLE_QUOTE +
          LINE_FEED,
      })),
    ],
  },
  ["json-stringify"]
);
