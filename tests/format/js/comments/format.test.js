const fixtures = {
  importMeta: import.meta,
  snippets: [
    "var a = { /* comment */      \nb };", // trailing whitespace after comment
    "var a = { /* comment */\nb };",
    {
      name: "Preserve trailing double spaces in JSDoc",
      code: "/**\n * This is a JSDoc comment with two spaces at the end of this line.  \n */\n",
      output:
        "/**\n * This is a JSDoc comment with two spaces at the end of this line.  \n */\n",
    },
    {
      name: "Remove trailing single space in JSDoc",
      code: "/**\n * This is a JSDoc comment with one space at the end of this line. \n */\n",
      output:
        "/**\n * This is a JSDoc comment with one space at the end of this line.\n */\n",
    },
    {
      name: "Remove trailing single space in non-JSDoc",
      code: "/***\n * This is a JSDoc comment with two spaces at the end of this line.  \n */\n",
      output:
        "/***\n * This is a JSDoc comment with two spaces at the end of this line.\n */\n",
    },
  ],
};

runFormatTest(fixtures, ["babel", "flow", "typescript"]);
runFormatTest(fixtures, ["babel", "flow", "typescript"], { semi: false });
