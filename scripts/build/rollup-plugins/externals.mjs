import path from "node:path";

export default function (modules = []) {
  const requires = modules.reduce((obj, mod) => {
    obj[mod] = path.basename(mod).replace(/\.js$/, "");
    return obj;
  }, {});

  return {
    name: "externals",

    load(importee) {
      if (requires[importee]) {
        return `module.exports = eval("require")("./${requires[importee]}");`;
      }
    },
  };
}
