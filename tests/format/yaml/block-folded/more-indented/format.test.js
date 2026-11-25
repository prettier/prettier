const snippets = [
  {
    name: "more-indented line wider than the print width",
    code: "key: >\n  short line\n    this more-indented line is far wider than the print width\n  another ordinary line that is long enough to wrap\n",
  },
  {
    name: "more-indented line starting with a tab",
    code: "key: >-\n  short line\n  \tthis tab-led line is far wider than the print width\n  another ordinary line that is long enough to wrap\n",
  },
  {
    name: "whitespace-only more-indented line",
    code: "key: >-\n  first ordinary line\n    \n  second ordinary line that is long enough to wrap\n",
  },
  {
    name: "more-indented line with explicit indentation indicator",
    code: "key: >2-\n    this more-indented line is far wider than the print width\n  ordinary line that is long enough to wrap\n",
  },
];

runFormatTest({ importMeta: import.meta, snippets }, ["yaml"], {
  proseWrap: "always",
  printWidth: 30,
});
