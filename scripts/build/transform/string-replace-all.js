import createMethodCallTransfrom from "./method-call.js";

const transformStringReplaceAll = createMethodCallTransfrom({
  method: "replaceAll",
  argumentsLength: 2,
  functionName: "__stringReplaceAll",
  functionImplementation: new URL(
    "../shims/string-replace-all.js",
    import.meta.url
  ),
});

export default transformStringReplaceAll;
