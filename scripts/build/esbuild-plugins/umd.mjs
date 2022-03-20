import fs from "node:fs";
import camelCase from "camelcase";
import { outdent } from "outdent";

function getUmdWrapper(name, build) {
  const path = name.split(".");
  const { minify } = build.initialOptions;
  const temporaryName = minify ? "m" : camelCase(name);
  const placeholder = "/*! bundled code !*/";

  let globalObjectText = [];
  for (let index = 0; index < path.length; index++) {
    const object = ["root", ...path.slice(0, index + 1)].join(".");
    if (index === path.length - 1) {
      globalObjectText.push(`${object} = factory();`);
    } else {
      globalObjectText.push(`${object} = ${object} || {};`);
    }
  }
  globalObjectText = globalObjectText
    .map((text) => `${" ".repeat(4)}${text}`)
    .join("\n");

  let wrapper = outdent`
    (function (factory) {
      if (typeof exports === "object" && typeof module === "object") {
        module.exports = factory();
      } else if (typeof define === "function" && define.amd) {
        define(factory);
      } else {
        var root =
          typeof globalThis !== "undefined"
            ? globalThis
            : typeof global !== "undefined"
            ? global
            : typeof self !== "undefined"
            ? self
            : this || {};
        ${globalObjectText.trimStart()}
      }
    })(function() {
      "use strict";${placeholder}
    });
  `;

  if (minify) {
    wrapper = build.esbuild
      .transformSync(wrapper, { loader: "js", minify })
      .code.trim();
  }

  const [intro, outro] = wrapper.split(placeholder);

  return {
    name: temporaryName,
    intro,
    outro,
    expectedOutput: {
      start: minify
        ? `"use strict";var ${temporaryName}=(()=>{`
        : `"use strict";\nvar ${temporaryName} = (() => {`,
      end: "})();",
    },
  };
}

export default function esbuildPluginUmd({ name }) {
  return {
    name: "umd",
    setup(build) {
      const options = build.initialOptions;
      const { globalName, format, outfile } = options;

      if (globalName) {
        throw new Error("'globalName' in options cannot be set.");
      }

      if (format !== "umd") {
        throw new Error("'format' options must be 'umd'.");
      }

      if (!outfile) {
        throw new Error("'outfile' options is required.");
      }

      const {
        name: temporaryName,
        intro,
        outro,
        expectedOutput,
      } = getUmdWrapper(name, build);
      options.globalName = temporaryName;
      options.format = "iife";

      build.onEnd((result) => {
        if (result.errors.length > 0) {
          return;
        }

        if (!fs.existsSync(outfile)) {
          throw new Error(`${outfile} not exists`);
        }
        const text = fs.readFileSync(outfile, "utf8").trim();
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
            outro
        );
      });
    },
  };
}
