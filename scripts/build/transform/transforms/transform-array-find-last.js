import createMethodCallTransform from "./create-method-call-transform.js";

const transformArrayFindLast = createMethodCallTransform({
  methodName: "findLast",
  argumentsLength: 1,
  functionName: "__arrayFindLast",
  functionImplementationUrl: new URL(
    "../../shims/array-find-last.js",
    import.meta.url,
  ),
});

export default transformArrayFindLast;
