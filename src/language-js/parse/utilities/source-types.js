export const SOURCE_TYPE_MODULE = /** @type {const} */ ("module");
export const SOURCE_TYPE_SCRIPT = /** @type {const} */ ("script");
export const SOURCE_TYPE_COMMONJS = /** @type {const} */ ("commonjs");

/** @type {readonly [SOURCE_TYPE_MODULE, SOURCE_TYPE_COMMONJS]} */
export const SOURCE_TYPE_COMBINATIONS = [
  SOURCE_TYPE_MODULE,
  SOURCE_TYPE_COMMONJS,
];

/** @returns {SOURCE_TYPE_MODULE | SOURCE_TYPE_COMMONJS | undefined} */
export function getSourceType(filepath) {
  if (typeof filepath !== "string") {
    return;
  }

  filepath = filepath.toLowerCase();

  if (/\.(?:mjs|mts)$/iu.test(filepath)) {
    return SOURCE_TYPE_MODULE;
  }

  if (/\.(?:cjs|cts)$/iu.test(filepath)) {
    return SOURCE_TYPE_COMMONJS;
  }
}
