import { visitorKeys as glimmerVisitorKeys } from "@glimmer/syntax";

const {
  // These node types present on `ElementNode`, but we don't care about them
  ElementStartNode,
  ElementPartNode,
  ElementEndNode,
  ElementNameNode,

  ...visitorKeys
} = glimmerVisitorKeys;

export default visitorKeys;
