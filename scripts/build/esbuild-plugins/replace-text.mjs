import fs from "node:fs/promises";

export default function esbuildPluginReplaceText({
  filter = /./,
  replacements,
}) {
  for (const replacement of replacements) {
    if (!replacement.file) {
      throw new Error("'file' option is required.");
    }

    if (Object.prototype.hasOwnProperty.call(replacement, "process")) {
      if (typeof replacement.process !== "function") {
        throw new Error("'process' option should be a function.");
      }

      continue;
    }

    if (
      !Object.prototype.hasOwnProperty.call(replacement, "find") ||
      !Object.prototype.hasOwnProperty.call(replacement, "replacement")
    ) {
      throw new Error(
        "'process' or 'find' and 'replacement' option is required."
      );
    }

    replacement.process = (text) =>
      text.replaceAll(replacement.find, replacement.replacement);
  }

  return {
    name: "replace-text",
    setup(build) {
      build.onLoad({ filter }, async ({ path: file }) => {
        let text = await fs.readFile(file, "utf8");

        for (const replacement of replacements) {
          if (replacement.file !== "*" && replacement.file !== file) {
            continue;
          }
          text = replacement.process(text);
        }

        return { contents: text };
      });
    },
  };
}
