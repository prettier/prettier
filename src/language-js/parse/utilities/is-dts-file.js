function isDtsFile(filepath) {
  if (typeof filepath !== "string") {
    return;
  }

  filepath = filepath.toLowerCase();

  return (
    filepath.endsWith(".d.ts") ||
    filepath.endsWith(".d.mts") ||
    filepath.endsWith(".d.cts")
  );
}

export { isDtsFile };
