runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["\uFEFF#!/usr/bin/env node\n/** @format */\nprettier"],
  },
  ["flow", "babel", "typescript"],
  { requirePragma: true },
);
