import fs from "node:fs/promises";

function replaceText(text, options) {
  return text.replaceAll(options.find, options.replacement);
}

export default function esbuildPluginReplaceText({
  filter = /./,
  replacements,
}) {
  for (const replacement of replacements) {
    if (!replacement.file) {
      throw new Error("'file' option is required.");
    }
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
          text = replaceText(text, replacement);
        }

        return { contents: text };
      });
    },
  };
}
