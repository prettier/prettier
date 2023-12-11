import fs from "node:fs";
import camelCase from "camelcase";
import { outdent } from "outdent";

const PLACEHOLDER = "__PLACEHOLDER__";
function getUmdWrapper({ name }, build) {
  const path = name.split(".");
  const { minify } = build.initialOptions;
  const temporaryName = minify ? "m" : camelCase(name);

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
      function interopModuleDefault() {
        var module = factory();
        return module.default || module;
      }

      if (typeof exports === "object" && typeof module === "object") {
        module.exports = interopModuleDefault();
      } else if (typeof define === "function" && define.amd) {
        define(interopModuleDefault);
      } else {
        var root =
          typeof globalThis !== "undefined"
            ? globalThis
            : typeof global !== "undefined"
              ? global
              : typeof self !== "undefined"
                ? self
                : this || {};
        ${globalObjectText.trimStart()} = interopModuleDefault();
      }
    })(function () {
      "use strict";${PLACEHOLDER}
    });
  `;

  if (minify) {
    wrapper = build.esbuild
      .transformSync(wrapper, { loader: "js", minify })
      .code.trim();
    if (!wrapper.includes(PLACEHOLDER)) {
      throw new Error("Unexpected code");
    }
  }

  const [intro, outro] = wrapper.split(PLACEHOLDER);

  return {
    name: temporaryName,
    intro,
    outro,
    expectedOutput: {
      start: minify
        ? `var ${temporaryName}=(()=>{`
        : `var ${temporaryName} = (() => {`,
      end: "})();",
    },
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

      build.onEnd((result) => {
        if (result.errors.length > 0) {
          return;
        }

        if (!fs.existsSync(outfile)) {
          throw new Error(`${outfile} not exists`);
        }
        let text = fs.readFileSync(outfile, "utf8").trim();
        // We already insert `"use strict";` in the wrapper
        if (text.startsWith('"use strict";')) {
          text = text.slice('"use strict";'.length).trimStart();
        }

        const actualOutput = {
          start: text.slice(0, expectedOutput.start.length),
          end: text.slice(-expectedOutput.end.length),
        };
        for (const property of ["start", "end"]) {
          if (actualOutput[property] !== expectedOutput[property]) {
            console.log();
            console.error(outdent`
              Expected output ${property}s with:
              ${expectedOutput[property]}

              Got:
              ${actualOutput[property]}
            `);
            throw new Error("Unexpected output");
          }
        }

        fs.writeFileSync(
          outfile,
          intro +
            text
              .slice(expectedOutput.start.length, -expectedOutput.end.length)
              .trimEnd() +
            outro,
        );
      });
    },
  };
}
