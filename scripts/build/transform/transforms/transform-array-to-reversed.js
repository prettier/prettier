import createMethodCallTransform from "./create-method-call-transform.js";

const transformArrayToReversed = createMethodCallTransform({
  methodName: "toReversed",
  argumentsLength: 0,
});

export default transformArrayToReversed;
