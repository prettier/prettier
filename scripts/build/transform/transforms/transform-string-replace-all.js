import createMethodCallTransform from "./create-method-call-transform.js";

const transformStringReplaceAll = createMethodCallTransform({
  methodName: "replaceAll",
  argumentsLength: 2,
});

export default transformStringReplaceAll;
