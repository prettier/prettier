"use strict";

function createPlugin({
  name: languageName,
  parserName = languageName,
  astFormat = languageName,
  print,
  finalNewLine = true,
}) {
  return {
    languages: [
      {
        name: languageName,
        parsers: [parserName],
        extensions: [`.${languageName}`],
      },
    ],
    parsers: {
      [parserName]: {
        parse: (text) => ({ value: text }),
        astFormat,
      },
    },
    printers: {
      [astFormat]: {
        print(path, options) {
          return (
            print(path.getValue().value, options) + (finalNewLine ? "\n" : "")
          );
        },
      },
    },
  };
}

module.exports = createPlugin;
