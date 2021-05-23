import path from "node:path";

export default function (modules = []) {
  const requires = new Map(
    modules.map((mod) => [mod, path.basename(mod).replace(/\.js$/, "")])
  );

  return {
    name: "externals",

    load(importee) {
      if (requires.has(importee)) {
        return `module.exports = eval("require")("./${requires.get(
          importee
        )}");`;
      }
    },
  };
}
