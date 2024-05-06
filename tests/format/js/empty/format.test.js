runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      ...[
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
      ].map((code) => ({ code, output: "" })),
      // comments
      "// comment",
      "/* comment */",
      "// comment\n",
      "/* comment */\n",
      "\n// comment\n",
      "\n/* comment */\n",
      "// comment\n;",
      "/* comment */\n;",
      ";\n// comment\n",
      "\n;/* comment */\n",
    ],
  },
  ["babel", "flow", "typescript"],
);
