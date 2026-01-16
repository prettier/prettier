import createMethodCallTransform from "./create-method-call-transform.js";

const transformFindLastIndex = createMethodCallTransform({
  methodName: "findLastIndex",
  argumentsLength: 1,
});

export default transformFindLastIndex;
