import fs from "node:fs/promises";

async function isDirectory(directory) {
  let stat;

  try {
    stat = await fs.stat(directory);
  } catch {
    return false;
  }

  return stat.isDirectory();
}

export default isDirectory;
