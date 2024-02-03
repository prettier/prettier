import { visitorKeys as glimmerVisitorKeys } from "@glimmer/syntax";

const {
  // These node types presents on `ElementNode`, but we don't care about them
  // https://github.com/glimmerjs/glimmer-vm/pull/1553
  ElementStartNode, // `ElementNode.startTag`
  ElementPartNode, // `ElementNode.parts`
  ElementEndNode, // `ElementNode.endTag`
  ElementNameNode, // `ElementNode.nameNode`

  // This presents on `{Block,ElementNode}.blockParamNodes`, but we don't care about them
  // https://github.com/glimmerjs/glimmer-vm/pull/1552
  BlockParam,

  ...visitorKeys
} = glimmerVisitorKeys;

export default visitorKeys;
