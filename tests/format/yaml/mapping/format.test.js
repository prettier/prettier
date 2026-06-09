// Bug: https://github.com/eemeli/yaml/issues/646
const errors = { yaml: ["3-style.yml"] };

runFormatTest(import.meta, ["yaml"], { errors });
runFormatTest(import.meta, ["yaml"], { tabWidth: 4, errors });
