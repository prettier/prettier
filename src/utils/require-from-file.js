import { createRequire } from "node:module";

function requireFromFile(id, parent) {
  return createRequire(parent)(id);
}

export default requireFromFile
