import assert from "node:assert";
import path from "node:path";
import url from "node:url";
import { isValidIdentifier } from "@babel/types";
import { outdent } from "outdent";
import serialize from "serialize-javascript";

function serializeModule(module) {
  return Object.entries(module)
    .map(([specifier, value]) => {
      const code =
        value instanceof RegExp
          ? `/${value.source}/${value.flags}`
          : serialize(value, { space: 2, unsafe: true });
      if (specifier === "default") {
        return `export default ${code};`;
      }

      if (!isValidIdentifier(specifier)) {
        throw new Error(`${specifier} is not a valid specifier`);
      }

      return `export const ${specifier} = ${code};`;
    })
    .join("\n");
}

function serializeVisitorKeys(module) {
  const specifiers = Object.keys(module);
  assert.deepEqual(specifiers, ["default"]);

  const references = new Map();
  const properties = Object.entries(module.default);
  for (const [, keys] of properties) {
    if (!references.has(keys)) {
      references.set(keys, 1);
    } else {
      references.set(keys, references.get(keys) + 1);
    }
  }

  const variables = [];
  const propertiesText = [];
  for (const [type, keys] of properties) {
    const isSingleReference = references.get(keys) === 1;
    const key = isValidIdentifier(type) ? type : JSON.stringify(type);
    if (isSingleReference) {
      propertiesText.push(`  ${key}: ${JSON.stringify(keys)},`);
    } else {
      if (!variables.includes(keys)) {
        variables.push(keys);
      }
      const index = variables.indexOf(keys);
      propertiesText.push(`  ${key}: vk[${index}],`);
    }
  }

  const code = outdent`
    const vk = [
    ${variables.map((keys) => `  ${JSON.stringify(keys)},`).join("\n")}
    ];

    export default {
    ${propertiesText.join("\n")}
    };
  `;

  return code;
}

export default function esbuildPluginEvaluate() {
  return {
    name: "evaluate",
    setup(build) {
      build.onLoad(
        { filter: /\.evaluate\.[cm]?js$/, namespace: "file" },
        async ({ path: filePath }) => {
          const module = await import(url.pathToFileURL(filePath));
          const isVisitorKeys =
            path.basename(filePath, path.extname(filePath)) ===
            "visitor-keys.evaluate";

          const text = isVisitorKeys
            ? serializeVisitorKeys(module)
            : serializeModule(module);

          return { contents: text };
        },
      );
    },
  };
}
