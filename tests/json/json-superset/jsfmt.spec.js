run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        name: "json",
        code:
          '"\u2028\u2029\u005F\\u2028\\u2029\\u005F\\\u2028\\\u2029\\\u005F"',
        output: '"\u2028\u2029_\\u2028\\u2029\\u005F\\\u2028\\\u2029_"\n',
      },
    ],
  },
  ["json", "json5"]
);
run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        name: "json-stringify",
        code:
          '"\u2028\u2029\u005F\\u2028\\u2029\\u005F\\\u2028\\\u2029\\\u005F"',
        output: '"\u2028\u2029_\u2028\u2029__"\n',
      },
    ],
  },
  ["json-stringify"]
);
