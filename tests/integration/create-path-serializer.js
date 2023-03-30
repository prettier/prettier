import path from "node:path";
const isWindows = (process.platform === "win32");

function createPathSerializer(options) {
  const replacements = Object.entries(options.replacements).flatMap(
    ([prefixPath, replacement]) => {
      if (!path.isAbsolute(prefixPath)) {
        throw new Error(`"${prefixPath}" is not a absolute path.`);
      }

      const variants = isWindows
        ? [
            prefixPath.charAt(0).toLowerCase() + prefixPath.slice(1),
            prefixPath.charAt(0).toUpperCase() + prefixPath.slice(1),
          ]
        : [prefixPath];

      return variants.map((path) => ({ path, replacement }));
    }
  );

  function replace(text) {
    for (const { path, replacement } of replacements) {
      text = text.replaceAll(path, replacement);
    }

    return text.replace(/\\/g, "/");
  }

  function test(value) {
    return (
      typeof value === "string" &&
      (value.includes("\\") ||
        replacements.some(({ path }) => value.includes(path)))
    );
  }

  function print(value, serializer) {
    return serializer(replace(value));
  }

  return { test, print };
}

export default createPathSerializer;
