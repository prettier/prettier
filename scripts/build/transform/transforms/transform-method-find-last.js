import createMethodCallTransform from "./create-method-call-transform.js";

const transformFindLast = createMethodCallTransform({
  methodName: "findLast",
  argumentsLength: 1,
});

export default transformFindLast;
