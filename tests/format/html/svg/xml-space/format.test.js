runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "unclosed svg",
        code: '<svg xml:space="preserve"><text>hello</text>',
        output: '<svg xml:space="preserve"><text>hello</text></svg>\n',
      },
      {
        name: "unclosed text",
        code: '<svg><text xml:space="preserve">hello',
        output: '<svg><text xml:space="preserve">hello</text></svg>\n',
      },
    ],
  },
  ["html", "angular"],
);
