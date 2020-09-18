run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        name: "empty",
        code: '<custom lang="markdown"></custom>',
      },
      {
        name: "spaces",
        code: '<custom lang="markdown">   </custom>',
      },
      {
        name: "new line",
        code: '<custom lang="markdown">\n \n</custom>',
      },
      {
        name: "non-space",
        code: '<custom lang="markdown">\n \u2005 \n</custom>',
      },
    ],
  },
  ["vue"]
);
