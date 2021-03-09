run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        code: '"\u2028\u2029\u0041\\u2028\\u2029\\u0041"',
        output: '"\u2028\u2029\u0041\\u2028\\u2029\\u0041"\n',
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
        code: '"\u2028\u2029\u0041\\u2028\\u2029\\u0041"',
        output: '"\u2028\u2029\u0041\u2028\u2029\u0041"\n',
      },
    ],
  },
  ["json-stringify"]
);
