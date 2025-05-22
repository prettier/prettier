import createMethodCallTransform from "./create-method-call-transform.js";

const transformRelativeIndexing = createMethodCallTransform({
  methodName: "at",
  argumentsLength: 1,
  functionImplementationUrl: new URL("../../shims/at.js", import.meta.url),
});

export default transformRelativeIndexing;
