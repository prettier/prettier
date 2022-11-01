/** @returns {"module" | "script" | undefined} */
function getSourceType(options) {
  let { filepath } = options;
  if (!filepath) {
    return;
  }
  filepath = filepath.toLowerCase();

  if (filepath.endsWith(".cjs")) {
    return "script";
  }

  if (filepath.endsWith(".mjs")) {
    return "module";
  }
}

export default getSourceType;
