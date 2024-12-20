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
  angularControlFlowBlock: ["children", "parameters"],
  angularControlFlowBlockParameters: ["children"],
  angularControlFlowBlockParameter: [],
  angularLetDeclaration: ["init"],
  angularLetDeclarationInitializer: [],
  angularIcuExpression: ["cases"],
  angularIcuCase: ["expression"],
};

export default visitorKeys;
