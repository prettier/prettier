const visitorKeys = {
  "front-matter": [],
  root: ["children"],
  element: ["attrs", "children"],
  ieConditionalComment: ["children"],
  ieConditionalStartComment: [],
  ieConditionalEndComment: [],
  interpolation: ["children"],
  text: ["children"],
  docType: [],
  comment: [],
  attribute: [],
  cdata: [],
  block: ["children", "parameters", "successorBlock"],
  blockParameter: [],
};

export default visitorKeys;
