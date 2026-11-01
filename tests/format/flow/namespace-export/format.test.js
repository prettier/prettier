const errors = {
  hermes: ["namespace.js.flow", "library.js"],
};

runFormatTest(import.meta, ["flow"], { errors });
runFormatTest(import.meta, ["flow"], { semi: false, errors });
