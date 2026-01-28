import { isIntersectionType, isUnionType } from "./node-types.js";

function shouldUnionTypePrintOwnComments({ key, parent }) {
  if (
    // If it's `types` of union type, parent will print comment for it
    (key === "types" && isUnionType(parent)) ||
    // Inside intersection type let the comment print outside of parentheses
    (key === "types" && isIntersectionType(parent))
  ) {
    return false;
  }

  return true;
}

export { shouldUnionTypePrintOwnComments };
