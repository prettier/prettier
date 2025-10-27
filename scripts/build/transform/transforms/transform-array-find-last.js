import createMethodCallTransform from "./create-method-call-transform.js";

const transformArrayFindLast = createMethodCallTransform({
  methodName: "findLast",
  argumentsLength: 1,
});

export default transformArrayFindLast;
