import { FRONT_MATTER_MARK } from "./constants.js";

function isFrontMatter(node) {
  return Boolean(node?.[FRONT_MATTER_MARK]);
}

export default isFrontMatter;
