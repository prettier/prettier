runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        code: "a { color: oklch(from red l c +130); }",
        output: "a {\n  color: oklch(from red l c +130);\n}\n",
      },
    ],
  },
  ["css", "scss", "less"],
);
