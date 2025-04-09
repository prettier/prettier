import createMethodCallTransform from "./create-method-call-transform.js";

const transformArrayFindLastIndex = createMethodCallTransform({
  methodName: "findLastIndex",
  argumentsLength: 1,
  functionName: "__arrayFindLastIndex",
  functionImplementationUrl: new URL(
    "../../shims/array-find-last-index.js",
    import.meta.url,
  ),
});

export default transformArrayFindLastIndex;
