import { shouldDisable } from "./failed-format-tests.js";
import { isErrorTest, isLanguage } from "./utilities.js";

function getParsers(dirname, parsers) {
  const allParsers = [...parsers];
  const addParsers = isErrorTest(dirname)
    ? () => {}
    : (...parsers) => {
        for (const parser of parsers) {
          if (!allParsers.includes(parser) && !shouldDisable(dirname, parser)) {
            allParsers.push(parser);
          }
        }
      };

  if (parsers.includes("babel") && (isLanguage("js") || isLanguage("jsx"))) {
    addParsers("acorn", "espree", "meriyah", "oxc");
  }

  if (parsers.includes("typescript")) {
    addParsers("babel-ts", "oxc-ts");
  }

  if (parsers.includes("flow")) {
    addParsers("hermes");
  }

  if (parsers.includes("babel")) {
    addParsers("__babel_estree");
  }

  return {
    explicitParsers: parsers,
    allParsers,
  };
}

export { getParsers };
