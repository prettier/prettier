const tests = [
  {
    code: "<C   {...   props} />",
    options: { semi: false },
  },
  {
    code: "<C   {...   props} />",
    options: { bracketSpacing: true },
  },
  {
    code: "<C   {...   props} />",
    options: { bracketSpacing: false },
  },
  {
    code: "<C   {...   long_long_long_long_long_long_long_call(   with_long_long_long_long_long_argument)} />",
    options: { trailingComma: "all" },
  },
  {
    code: "<C   {...   props} />",
    options: { embeddedLanguageFormatting: "off" },
  },
];

for (const { code, options } of tests) {
  runFormatTest(
    {
      importMeta: import.meta,
      snippets: [code],
    },
    ["mdx"],
    options,
  );
}
