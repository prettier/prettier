/** @returns {"module" | "script" | undefined} */
function getSourceType(options) {
  let { filepath } = options;
  if (!filepath) {
    return;
  }
  filepath = filepath.toLowerCase();

  if (filepath.endsWith(".cjs") || filepath.endsWith(".cts")) {
    return "script";
  }

  if (filepath.endsWith(".mjs") || filepath.endsWith(".mts")) {
    return "module";
  }
}

export default getSourceType;
