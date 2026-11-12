const errors = {
  // Yuku rejects exports in statement bodies before printing.
  "yuku-ts": ["ignored-export-wrappers.ts"],
};

runFormatTest(import.meta, ["typescript"], { semi: false, errors });
runFormatTest(import.meta, ["typescript"], { semi: true, errors });
