run_spec(__dirname, ["yaml"]);
run_spec(__dirname, ["yaml"], { tabWidth: 4 });
// [prettierx] support --no-yaml-bracket-spacing option
// with bogus option to improve consistency of snapshot with Prettier 2.3.2
run_spec(__dirname, ["yaml"], { bogus: null, yamlBracketSpacing: false });
