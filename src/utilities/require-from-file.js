import { createRequire } from "node:module";

function requireFromFile(id, parent) {
  const require = createRequire(parent);
  return require(id);
}

export default requireFromFile;
