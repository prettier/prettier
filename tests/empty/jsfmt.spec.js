const prettier = require("prettier/local");
const parsers = prettier
  .getSupportInfo()
  .options.find(option => option.name === "parser");

run_spec(
  __dirname,
  parsers.choices
    .filter(choice => !choice.deprecated)
    .map(choice => choice.value)
);
