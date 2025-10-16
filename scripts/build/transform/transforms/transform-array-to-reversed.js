import createMethodCallTransform from "./create-method-call-transform.js";

const transformArrayToReversed = createMethodCallTransform({
  methodName: "toReversed",
  argumentsLength: 0,
  functionName: "__arrayToReversed",
  functionImplementationUrl: new URL(
    "../../shims/array-to-reversed.js",
    import.meta.url,
  ),
});

export default transformArrayToReversed;
