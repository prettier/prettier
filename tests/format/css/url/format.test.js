runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "url modifiers",
        code: '.button { background-image: url("test.jpg" param(--some-param: #fc3)); }',
        output:
          '.button {\n  background-image: url("test.jpg" param(--some-param: #fc3));\n}\n',
      },
      {
        name: "multiple url modifiers",
        code: 'a { background: url("test.jpg" foo bar(1) baz); }',
        output: 'a {\n  background: url("test.jpg" foo bar(1) baz);\n}\n',
      },
      {
        name: "url modifier whitespace",
        code: "a { background: URL( 'test.jpg'\n  foo\tbar(1) ); }",
        output: 'a {\n  background: URL("test.jpg" foo bar(1));\n}\n',
      },
    ],
  },
  ["css"],
);
