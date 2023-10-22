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
  ifBlock: ["test", "consequent", "alternate"],
  forBlock: ["parameters", "children", "empty"],
  block: ["parameters", "children"],
  blockParameter: ["expression"],
};

export default visitorKeys;
