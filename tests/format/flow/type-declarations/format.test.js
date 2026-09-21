const errors = { hermes: ["declare_namespace_new.js"] };

runFormatTest(import.meta, ["flow"], { errors });
runFormatTest(import.meta, ["flow"], { errors, semi: false });
