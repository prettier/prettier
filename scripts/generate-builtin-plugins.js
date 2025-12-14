import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { isValidIdentifier } from "@babel/types";
import { outdent } from "outdent";
import { format } from "prettier";
import { toPath } from "url-or-path";

const projectRoot = new URL("../", import.meta.url);
const sourceDirectory = new URL("./src/", projectRoot);
const buildScript = `node ${import.meta.url.slice(projectRoot.href.length)}`;
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

async function getPluginData(file, pluginFile, getPluginName, kind) {
  const pluginName = getPluginName(pluginFile);
  assert.ok(
    isValidIdentifier(pluginName),
    `Invalid plugin name '${pluginName}'.`,
  );

  pluginFile = new URL(pluginFile, sourceDirectory);

  const implementation = await import(pluginFile);
  const importSource = getImportSource(file, pluginFile);

  const pluginData = {
    name: pluginName,
    importSource,
    file: pluginFile,
    parserNames: Object.hasOwn(implementation, "parsers")
      ? Object.keys(implementation.parsers)
      : undefined,
    printerNames: Object.hasOwn(implementation, "printers")
      ? Object.keys(implementation.printers)
      : undefined,
  };

  for (const property of ["languages", "options"]) {
    if (!Object.hasOwn(implementation, property)) {
      continue;
    }

    const value = implementation[property];
    pluginData[property] = {
      value,
      variableName: `${pluginName}${property[0].toUpperCase() + property.slice(1)}`,
    };

    const entry =
      kind === "development"
        ? // If we import `languages` and `options` from the `index.js`
          // It will be much slower to load builtin plugins
          await locateLanguageOrOptions(pluginData, property)
        : {
            url: pluginFile,
            specifier: property,
          };

    pluginData[property].entry = entry;
  }

  return pluginData;
}

function getImportStatements(file, plugin) {
  const statements = new Map();

  for (const property of ["languages", "options"]) {
    if (!plugin[property]) {
      continue;
    }

    const { entry, variableName } = plugin[property];
    const { url } = entry;
    const specifier = {
      imported: entry.specifier,
      local: variableName,
    };

    if (!statements.has(url)) {
      statements.set(url, []);
    }

    statements.get(url).push(specifier);
  }

  if (statements.size === 0) {
    return;
  }

  const statementsText = [];
  for (const [url, specifiers] of statements) {
    let defaultSpecifier = "";
    const namedSpecifiers = [];
    for (const [index, { local, imported }] of specifiers.entries()) {
      if (imported === "default") {
        assert.ok(
          index === 0,
          `Unexpected specifier '${imported}' at index '${index}'.`,
        );
      }
      if (imported === "default") {
        defaultSpecifier = local;
      } else {
        namedSpecifiers.push(`${imported} as ${local}`);
      }
    }
    let statementText = "import";
    if (defaultSpecifier) {
      statementText += ` ${defaultSpecifier}`;
    }

    if (namedSpecifiers.length > 0) {
      if (defaultSpecifier) {
        statementText += ",";
      }

      statementText += ` {${namedSpecifiers.join(",")}}`;
    }

    const source = getImportSource(file, url);
    statementText += ` from "${source}";`;
    statementsText.push(statementText);
  }

  return statementsText.join("\n");
}

function getPluginExportStatement(plugin) {
  const properties = {
    name: JSON.stringify(plugin.name),
    importPlugin: `() => import("${plugin.importSource}")`,
  };

  if (plugin.options) {
    properties.options = plugin.options.variableName;
  }

  if (plugin.languages) {
    properties.languages = plugin.languages.variableName;
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

async function buildPlugins({ kind, file, pattern, getPluginName }) {
  const plugins = await Array.fromAsync(
    fs.glob(pattern, { cwd: sourceDirectory }),
    (pluginFile) => getPluginData(file, pluginFile, getPluginName, kind),
  );

  // Split js plugin for https://github.com/prettier/prettier/pull/18481
  if (kind === "development") {
    const jsPlugin = plugins.find(({ name }) => name === "js");
    const estreePlugin = { ...jsPlugin, name: "estree" };
    delete estreePlugin.languages;
    delete estreePlugin.options;
    delete estreePlugin.parserNames;
    delete jsPlugin.printerNames;
    plugins.push(estreePlugin);
  }

  plugins.sort((pluginA, pluginB) =>
    pluginA.importSource.localeCompare(pluginB.importSource),
  );

  const code = outdent`
    /*
    Generated file, do NOT edit
    Run \`${buildScript}\` to regenerate
    */

    ${plugins
      .map((plugin) => getImportStatements(file, plugin))
      .filter(Boolean)
      .join("\n")}
    import {toLazyLoadPlugin} from "./utilities.js";

    ${plugins.map((plugin) => getPluginExportStatement(plugin, kind)).join("\n")}
  `;

  const formatted = await format(code, { parser: "meriyah" });

  await fs.writeFile(file, formatted);
}

async function locateLanguageOrOptions(plugin, property) {
  const directory = new URL("./", plugin.file);
  const possibleEntries = await Array.fromAsync(
    fs.glob(
      property === "languages"
        ? ["languages.js", "languages.evaluate.js"]
        : ["options.js"],
      { cwd: directory },
    ),
  );
  assert.equal(
    possibleEntries.length,
    1,
    `Can not locate '${property}' entry for plugin '${plugin.name}'.`,
  );
  const [file] = possibleEntries;
  const url = new URL(file, directory);
  const implementation = await import(url);
  if (implementation.default === plugin[property].value) {
    return {
      url,
      specifier: "default",
    };
  }

  throw new Error(
    `Can not locate '${property}' entry for plugin '${plugin.name}'.`,
  );
}

await Promise.all(pluginFiles.map((plugins) => buildPlugins(plugins)));
