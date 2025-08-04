runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // https://github.com/facebook/hermes/blob/83c811545b35dc2284ba27786314936e4c80ee6a/test/Parser/flow/match/statement-no-arg.js
      "match () {}",
      // https://github.com/facebook/hermes/blob/83c811545b35dc2284ba27786314936e4c80ee6a/test/Parser/flow/match/statement-spread-arg.js
      "match (...b) {}",
    ],
  },
  ["flow", "hermes"],
);
