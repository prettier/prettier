function isDtsFile(filepath) {
  return typeof filepath === "string" && /\.d\.(?:ts|mts|cts)$/i.test(filepath);
}

export { isDtsFile };
