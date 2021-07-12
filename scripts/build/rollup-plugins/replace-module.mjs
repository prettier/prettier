export default function (replacements = {}) {
  return {
    name: "replace-module",

    load(importee) {
      if (!Reflect.has(replacements, importee)) {
        return;
      }

      const replacement = replacements[importee];

      if (typeof replacement === "string") {
        return `export default require(${JSON.stringify(replacement)});`;
      }

      return replacement.code;
    },
  };
}
