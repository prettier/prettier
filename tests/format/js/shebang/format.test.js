runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "Empty file with shebang",
        code: "#!/usr/bin/env node",
      },
      {
        name: "Empty file with shebang",
        code: "#!/usr/bin/env node\n",
      },
    ],
  },
  ["babel", "flow", "typescript"],
);
