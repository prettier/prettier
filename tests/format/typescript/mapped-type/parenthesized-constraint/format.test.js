runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      ["(keyof Input)", "(keyof Input)"],
      ["((keyof Input))", "(keyof Input)"],
      ["keyof Input", "keyof Input"],
      ["keyof (Input)", "keyof Input"],
      ["/* ( */ keyof Input /* ) */", "/* ( */ keyof Input /* ) */"],
    ].map(([input, output]) => ({
      code: `type Result = { [Key in ${input}]: boolean };`,
      output: `type Result = { [Key in ${output}]: boolean };\n`,
    })),
  },
  ["typescript", "babel-ts"],
);
