export const SOURCE_TYPE_MODULE = "module";
export const SOURCE_TYPE_SCRIPT = "script";

/** @type {["module", "script"]} */
export const SOURCE_TYPE_COMBINATIONS = [
  SOURCE_TYPE_MODULE,
  SOURCE_TYPE_SCRIPT,
];

/** @returns {"module" | "script" | undefined} */
export function getSourceType(filepath) {
  if (typeof filepath !== "string") {
    return;
  }

  filepath = filepath.toLowerCase();

  if (/\.(?:mjs|mts)$/iu.test(filepath)) {
    return SOURCE_TYPE_MODULE;
  }

  if (/\.(?:cjs|cts)$/iu.test(filepath)) {
    return SOURCE_TYPE_SCRIPT;
  }
}
