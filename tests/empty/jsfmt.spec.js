const core = require("../../src/main/core-options");

run_spec(
  __dirname,
  core.options.parser.choices
    .filter(choice => !choice.deprecated)
    .map(choice => choice.value)
    .filter(
      parser =>
        ["json", "json5", "json-stringify", "graphql"].indexOf(parser) === -1
    )
);
