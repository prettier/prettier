run_spec(
  {
    dirname: __dirname,
    snippets: [
      "{foo}",
      '{["foo"]:"bar"}',
      '{"foo": ~1}',
      '{"foo": false || "bar"}',
      '{"foo": undefined}',
      '{"foo": () => {}}',
    ],
  },
  ["json-stringify"]
);

run_spec(
  {
    dirname: __dirname,
    snippets: [
      "packages\\the-hub\\cypress\\fixtures\\gridConfiguration.json",
      "1+2",
    ],
  },
  ["json"]
);
