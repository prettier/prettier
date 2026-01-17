import createMethodCallTransform from "./create-method-call-transform.js";

const transformIsWellFormed = createMethodCallTransform({
  methodName: "isWellFormed",
  argumentsLength: 0,
});

export default transformIsWellFormed;
