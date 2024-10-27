run_spec(
  {
    dirname: __dirname,
    snippets: ["\uFEFF#!/usr/bin/env node\n/** @format */\nprettier"],
  },
  ["flow", "babel", "typescript"],
  { requirePragma: true }
);
