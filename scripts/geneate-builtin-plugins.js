import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { isValidIdentifier } from "@babel/types";
import { outdent } from "outdent";
import { toPath } from "url-or-path";
import { format } from "../node_modules/prettier/index.mjs";

const sourceDirectory = new URL("../src/", import.meta.url);
const pluginFiles = [
  {
    kind: "development",
    pattern: "language-*/index.js",
    file: new URL(
      "main/plugins/builtin-plugins/development-plugins.js",
      sourceDirectory,
    ),
    getPluginName: (file) => path.dirname(file).slice("language-".length),
  },
  {
    kind: "production",
    pattern: "plugins/*.js",
    file: new URL(
      "main/plugins/builtin-plugins/production-plugins.js",
      sourceDirectory,
    ),
    getPluginName: (file) => path.basename(file, path.extname(file)),
  },
];

function getImportSource(from, to) {
  from = toPath(from);
  to = toPath(to);

  const relation = path.relative(path.dirname(from), to);

  return relation.replaceAll("\\", "/");
}

async function getPluginData(file, pluginFile, getPluginName) {
  const pluginName = getPluginName(pluginFile);
  assert.ok(
    isValidIdentifier(pluginName),
    `Invalid plugin name '${pluginName}'.`,
  );

  pluginFile = new URL(pluginFile, sourceDirectory);

  const plugin = await import(pluginFile);
  const importSource = getImportSource(file, pluginFile);

  return {
    name: pluginName,
    importSource,
    file: pluginFile,
    hasLanguages: Object.hasOwn(plugin, "languages"),
    hasOptions: Object.hasOwn(plugin, "options"),
    parserNames: Object.hasOwn(plugin, "parsers")
      ? Object.keys(plugin.parsers)
      : undefined,
    printerNames: Object.hasOwn(plugin, "printers")
      ? Object.keys(plugin.printers)
      : undefined,
  };
}

function getImportStatements(plugin) {
  const specifiers = [];

  if (plugin.hasLanguages) {
    specifiers.push(`languages as ${plugin.name}Languages`);
  }

  if (plugin.hasOptions) {
    specifiers.push(`options as ${plugin.name}Options`);
  }

  if (specifiers.length === 0) {
    return;
  }

  return outdent`
    import {${specifiers.join(", ")}} from "${plugin.importSource}";
  `;
}

function getPluginExportStatement(plugin) {
  const properties = {
    importPlugin: `() => import("${plugin.importSource}")`,
  };

  if (plugin.hasOptions) {
    properties.options = `${plugin.name}Options`;
  }

  if (plugin.hasLanguages) {
    properties.languages = `${plugin.name}Languages`;
  }

  if (plugin.parserNames) {
    properties.parserNames = JSON.stringify(plugin.parserNames);
  }

  if (plugin.printerNames) {
    properties.printerNames = JSON.stringify(plugin.printerNames);
  }

  return outdent`
    export const ${plugin.name} = /* @__PURE__ */ toLazyLoadPlugin({
      ${Object.entries(properties)
        .map(([property, code]) => `${property}: ${code},`)
        .join("\n")}
    });
  `;
}

async function buildPlugins({ file, pattern, getPluginName }) {
  const plugins = await Array.fromAsync(
    fs.glob(pattern, { cwd: sourceDirectory }),
    (pluginFile) => getPluginData(file, pluginFile, getPluginName),
  );

  plugins.sort((pluginA, pluginB) =>
    pluginA.importSource.localeCompare(pluginB.importSource),
  );

  const code = outdent`
    // Generated file, do NOT edit

    ${plugins
      .map((plugin) => getImportStatements(plugin))
      .filter(Boolean)
      .join("\n")}
    import {toLazyLoadPlugin} from "./utilities.js";

    ${plugins.map((plugin) => getPluginExportStatement(plugin)).join("\n")}
  `;

  const formatted = await format(code, { parser: "meriyah" });

  await fs.writeFile(file, formatted);
}

await Promise.all(pluginFiles.map((plugins) => buildPlugins(plugins)));
