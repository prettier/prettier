import createMethodCallTransform from "./create-method-call-transform.js";

const transformAt = createMethodCallTransform({
  methodName: "at",
  argumentsLength: 1,
});

export default transformAt;
