import { createRequire } from "node:module";
import path from "node:path";

function requireFrom(id, directory) {
  const require = createRequire(path.join(directory, "noop.js"));
  return require(id);
}

export default requireFrom;
