import { fileURLToPath } from "node:url";

const isWindows = process.platform === "win32";

function createPathSerializer(options) {
  const replacements = [];
  for (const [url, replacement] of options.replacements.entries()) {
    const path = fileURLToPath(url);

    for (const find of isWindows
      ? [path.charAt(0).toLowerCase() + path.slice(1),
          path.charAt(0).toUpperCase() + path.slice(1),
        ]
      : [path]) {
      replacements.push({ find, replacement });
    }
  }

  function replace(text) {
    for (const { find, replacement } of replacements) {
      text = text.replaceAll(find, replacement);
    }

    return text.replaceAll("\\", "/");
  }

  function test(value) {
    return (
      typeof value === "string" &&
      (value.includes("\\") ||
        replacements.some(({ find }) => value.includes(find)))
    );
  }

  function print(value, serializer) {
    return serializer(replace(value));
  }

  return { test, print };
}

export default createPathSerializer;
