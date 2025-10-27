import createMethodCallTransform from "./create-method-call-transform.js";

const transformRelativeIndexing = createMethodCallTransform({
  methodName: "at",
  argumentsLength: 1,
});

export default transformRelativeIndexing;
