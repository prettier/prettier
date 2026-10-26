runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "type assertion after a broken member chain",
        code: `const result = [1, 2, 3]
  .map((n) => ({
    id: n,
  }))
  .filter((n) => n.id > 1) as {
  id: string;
};`,
        output: `const result = [1, 2, 3]
  .map((n) => ({
    id: n,
  }))
  .filter((n) => n.id > 1) as {
    id: string;
  };
`,
      },
    ],
  },
  ["typescript"],
);

runFormatTest(import.meta, ["typescript"], { printWidth: 40 });
runFormatTest(import.meta, ["typescript"], { tabWidth: 4, useTabs: true });
