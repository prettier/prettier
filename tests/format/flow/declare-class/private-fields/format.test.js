const errors = {
  hermes: ["private.js.flow"],
};

runFormatTest(import.meta, ["flow"], { errors });
runFormatTest(import.meta, ["flow"], { semi: false, errors });
