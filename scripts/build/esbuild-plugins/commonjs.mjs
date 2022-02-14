import fs from "node:fs";
import camelCase from "camelcase";
import { outdent } from "outdent";

function getUmdWrapper({ name, interopDefault = false }, build) {
  const path = name.split(".");
  const { minify } = build.initialOptions;
  const temporaryName = minify ? "m" : camelCase(name);
  const placeholder = "/*! bundled code !*/";

  let globalObjectText = [];
  for (let index = 0; index < path.length; index++) {
    const object = ["root", ...path.slice(0, index + 1)].join(".");
    if (index === path.length - 1) {
      globalObjectText.push(`${object}`);
    } else {
      globalObjectText.push(`${object} = ${object} || {};`);
    }
  }
  globalObjectText = globalObjectText
    .map((text) => `${" ".repeat(4)}${text}`)
    .join("\n");

  let wrapper = outdent`
    (function (factory) {
      function interopModuleDefault(factory) {
        var module = factory();
        return module${interopDefault ? ".default" : ""};
      }

      if (typeof exports === "object" && typeof module === "object") {
        module.exports = interopModuleDefault(factory);
      } else if (typeof define === "function" && define.amd) {
        define(function () {
          return interopModuleDefault(factory)
        });
      } else {
        var root =
          typeof globalThis !== "undefined"
            ? globalThis
            : typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : this || {};
        ${globalObjectText.trimStart()} = interopModuleDefault(factory);
      }
    })(function() {
    "use strict";
    ${placeholder}
    return ${temporaryName};
    });
  `;

  if (minify) {
    wrapper = build.esbuild
      .transformSync(wrapper, { loader: "js", minify })
      .code.trim();
  }

  const [intro, outro] = wrapper.split(placeholder);

  const expectedOutput = `var ${temporaryName}${minify ? "=" : " = "}`;

  return {
    name: temporaryName,
    intro,
    outro,
    expectedOutput,
  };
}

export default function esbuildPluginCommonjs() {
  return {
    name: "commonjs",
    setup(build) {
      const { onEnd, initialOptions: esbuildOptions } = build;

      onEnd(() => {
        const file = esbuildOptions.outfile;

        if (!fs.existsSync(file)) {
          throw new Error(`${file} not exists`);
        }

        const text = fs.readFileSync(file, "utf8").trim();
        const lines = text.split("\n");
        let lastLine = lines[lines.length - 1];

        if (!lastLine.startsWith("module.exports = __toCommonJS(")) {
          throw new Error("Unexpected output.");
        }

        lastLine = lastLine.replace(/;$/, ".default;");
        lines[lines.length - 1] = lastLine;

        fs.writeFileSync(file, lines.join("\n"));
      });
    },
  };
}
