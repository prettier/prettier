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

export default function esbuildPluginUmd(options) {
  return {
    name: "umd",
    setup(build) {
      const esbuildOptions = build.initialOptions;
      const { globalName, format, outfile } = esbuildOptions;

      if (globalName) {
        throw new Error("'globalName' in esbuildOptions cannot be set.");
      }

      if (format !== "umd") {
        throw new Error("'format' esbuildOptions must be 'umd'.");
      }

      if (!outfile) {
        throw new Error("'outfile' esbuildOptions is required.");
      }

      const {
        name: temporaryName,
        intro,
        outro,
        expectedOutput,
      } = getUmdWrapper(options, build);
      esbuildOptions.globalName = temporaryName;
      esbuildOptions.format = "iife";

      build.onEnd(() => {
        if (!fs.existsSync(outfile)) {
          throw new Error(`${outfile} not exists`);
        }

        // We already insert `"use strict";` in the wrapper
        let text = fs.readFileSync(outfile, "utf8");
        if (text.startsWith('"use strict";')) {
          text = text.slice('"use strict";'.length).trimStart();
        }
        const actualOutput = text.slice(0, expectedOutput.length);
        if (actualOutput !== expectedOutput) {
          console.log();
          console.error(outdent`
            Expected output starts with:
            ${expectedOutput}

            Got:
            ${actualOutput}
          `);
          throw new Error("Unexpected output");
        }

        fs.writeFileSync(outfile, intro + text.trim() + outro);
      });
    },
  };
}
