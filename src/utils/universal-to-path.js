import { fileURLToPath } from "node:url";
import fromFileUrl from "deno-path-from-file-url";

export default process.env.PRETTIER_TARGET === "universal"
  ? fromFileUrl
  : fileURLToPath;
