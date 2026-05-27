import createFunctionCallTransform from "./create-function-call-transform.js";

const transformObjectGroupBy = createFunctionCallTransform({
  function: "Object.groupBy",
  argumentsLength: 2,
});

export default transformObjectGroupBy;
