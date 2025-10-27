import createMethodCallTransform from "./create-method-call-transform.js";

const transformArrayFindLastIndex = createMethodCallTransform({
  methodName: "findLastIndex",
  argumentsLength: 1,
});

export default transformArrayFindLastIndex;
