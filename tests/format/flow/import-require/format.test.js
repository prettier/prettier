const errors = { hermes: ["import-require.js"] };

runFormatTest(import.meta, ["flow"], { errors, printWidth: 50 });
