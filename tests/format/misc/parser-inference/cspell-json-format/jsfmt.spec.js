run_spec({
  dirname: __dirname,
  snippets: [
    {
      name: "cspell.json",
      filename: "foo/bar/cspell.json",
      code: '{"version": "0.1",}',
      output: '{\n    "version": "0.1"\n}',
    },
  ],
});
run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        name: "cspell.json (ignore tabWidth and useTabs)",
        filename: "foo/bar/cspell.json",
        code: '{"version": "0.1",}',
        output: '{\n    "version": "0.1"\n}',
      },
    ],
  },
  [],
  { tabWidth: 2, useTabs: true }
);
