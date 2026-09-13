for (const semi of [false, true]) {
  runFormatTest(import.meta, ["babel", "flow", "typescript"], {
    experimentalTernaries: true,
    printWidth: 40,
    semi,
  });
}
