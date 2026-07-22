import { generateReferenceSharedVisitorKeys } from "../utilities/visitor-keys.js";

const visitorKeys = generateReferenceSharedVisitorKeys({
  root: ["children"],
  element: ["attrs", "startTagComments", "children"],
  ieConditionalComment: ["children"],
  ieConditionalStartComment: [],
  ieConditionalEndComment: [],
  interpolation: ["children"],
  text: ["children"],
  docType: [],
  comment: [],
  attribute: [],
  startTagComment: [],
  cdata: [],
  angularControlFlowBlock: ["children", "parameters"],
  angularControlFlowBlockParameters: ["children"],
  angularControlFlowBlockParameter: [],
  angularLetDeclaration: ["init"],
  angularLetDeclarationInitializer: [],
  angularIcuExpression: ["cases"],
  angularIcuCase: ["expression"],
});

export default visitorKeys;
