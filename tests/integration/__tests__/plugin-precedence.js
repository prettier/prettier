describe("json-stringify takes precedence over json for package.json", () => {
  runCli("plugins", ["--stdin-filepath=package.json"], {
    input:
      '{ "a": "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong" }',
  }).test({
    stdout:
      '{\n  "a": "longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong"\n}',
    stderr: "",
    status: 0,
    write: [],
  });
});
