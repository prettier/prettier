for (const proseWrap of ["always", "never", "preserve"]) {
  runFormatTest(import.meta, ["yaml"], { proseWrap, printWidth: 61 });
}
