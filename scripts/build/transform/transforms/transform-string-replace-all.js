import createMethodCallTransform from "./create-method-call-transform.js";

const transformStringReplaceAll = createMethodCallTransform({
  methodName: "replaceAll",
  argumentsLength: 2,
  functionName: "__stringReplaceAll",
  functionImplementationUrl: new URL(
    "../../shims/string-replace-all.js",
    import.meta.url,
  ),
});

export default transformStringReplaceAll;
