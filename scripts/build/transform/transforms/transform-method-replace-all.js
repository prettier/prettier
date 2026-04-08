import createMethodCallTransform from "./create-method-call-transform.js";

const transformReplaceAll = createMethodCallTransform({
  methodName: "replaceAll",
  argumentsLength: 2,
});

export default transformReplaceAll;
