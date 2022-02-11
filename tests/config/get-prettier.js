
import { pathToFileURL } from "node:url";
import path from "node:path";

const getPrettier = async () => {
  const entry = pathToFileURL(path.join(process.env.PRETTIER_DIR, "index.js"));

  const { default: prettier } = await import(entry);

  return prettier
}

export default getPrettier;
