const errors = { hermes: ["abstract-class.js"] };

runFormatTest(import.meta, ["flow"], { errors });
runFormatTest(import.meta, ["flow"], { errors, semi: false });
