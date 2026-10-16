runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        code: ".foo { --my-var: in oklab,; }",
        output: ".foo {\n  --my-var: in oklab,;\n}\n",
      },
    ],
  },
  ["css", "scss", "less"],
);
