run_spec(
  {
    dirname: __dirname,
    snippets: [
      // empty
      "",
      // empty lines
      "\n",
      "\n\n\n\n",
      // semicolons
      ";",
      ";;;;",
      ";\n",
      ";\n\n;;;\n",
    ],
  },
  ["babel", "flow", "typescript"]
);
