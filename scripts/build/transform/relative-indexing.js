import createMethodCallTransfrom from "./method-call.js";

const transformRelativeIndexing = createMethodCallTransfrom({
  method: "at",
  argumentsLength: 1,
  functionImplementation: new URL("../shims/at.js", import.meta.url),
});

export default transformRelativeIndexing;
