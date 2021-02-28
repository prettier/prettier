run_spec(
  {
    name: "json-stringify",
    dirname: __dirname,
    snippets: [
      "{foo}",
      '{["foo"]:"bar"}',
      '{"foo": ~1}',
      '{"foo": false || "bar"}',
      '{"foo": undefined}',
      '{"foo": () => {}}',
      '/* comment */{"foo": 1}',
      '// comment\n{"foo": 1}',
    ],
  },
  ["json-stringify"]
);

run_spec(
  {
    name: "json",
    dirname: __dirname,
    snippets: [
      "packages\\the-hub\\cypress\\fixtures\\gridConfiguration.json",
      "1+2",
      "+-1",
      "+'string'",
      "{key: +{}}"
    ],
  },
  ["json"]
);
