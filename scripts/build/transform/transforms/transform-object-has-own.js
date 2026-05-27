import createFunctionCallTransform from "./create-function-call-transform.js";

const transformObjectHasOwn = createFunctionCallTransform({
  function: "Object.hasOwn",
  argumentsLength: 2,
});

export default transformObjectHasOwn;
