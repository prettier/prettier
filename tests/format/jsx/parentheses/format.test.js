runFormatTest(
  {
    importMeta: import.meta,
    snippets: ["export default <></>", "export default <div/>"],
  },
  ["babel", "typescript", "flow"],
);
