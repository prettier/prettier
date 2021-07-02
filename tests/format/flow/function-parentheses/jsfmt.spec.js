// [prettierx] test with babel-flow & reproduce error with TypeScript
// (all TypeScript parsers)
// with options in alphabetical order in this jsfmt script

const errorList = ["single.js", "test.js"];

const errors = {
  __typescript_estree: errorList,
  "babel-ts": errorList,
  typescript: errorList,
};

run_spec(__dirname, ["flow", "babel", "babel-flow", "typescript"], { errors });

run_spec(__dirname, ["flow", "babel", "babel-flow", "typescript"], {
  errors,
  arrowParens: "avoid",
});

run_spec(__dirname, ["flow", "babel", "babel-flow", "typescript"], {
  errors,
  trailingComma: "all",
});
