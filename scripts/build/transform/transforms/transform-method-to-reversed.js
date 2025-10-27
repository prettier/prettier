import createMethodCallTransform from "./create-method-call-transform.js";

const transformToReversed = createMethodCallTransform({
  methodName: "toReversed",
  argumentsLength: 0,
});

export default transformToReversed;
