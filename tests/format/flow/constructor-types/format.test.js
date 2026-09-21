const errors = { hermes: ["constructor-types.js"] };

runFormatTest(import.meta, ["flow"], { errors, printWidth: 50 });
