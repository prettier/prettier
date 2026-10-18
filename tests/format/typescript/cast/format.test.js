runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "indent a type literal after a broken method chain (#17997)",
        code: [
          "const result = [1, 2, 3]",
          "  .map((n) => ({",
          "    id: n",
          "  }))",
          "  .filter((n) => n.id > 1) as {",
          "  id: string;",
          "};",
        ].join("\n"),
        output: [
          "const result = [1, 2, 3]",
          "  .map((n) => ({",
          "    id: n,",
          "  }))",
          "  .filter((n) => n.id > 1) as {",
          "    id: string;",
          "  };",
          "",
        ].join("\n"),
      },
      {
        name: "leave ordinary multiline type assertions at normal indentation",
        code: [
          "const result = fetchData() as {",
          "id: string;",
          "};",
        ].join("\n"),
        output: [
          "const result = fetchData() as {",
          "  id: string;",
          "};",
          "",
        ].join("\n"),
      },
      {
        name: "leave a one-line member call's type literal at normal indentation",
        code: [
          "const result = values.map((value) => value) as {",
          "id: number;",
          "};",
        ].join("\n"),
        output: [
          "const result = values.map((value) => value) as {",
          "  id: number;",
          "};",
          "",
        ].join("\n"),
      },
    ],
  },
  ["typescript"],
);
