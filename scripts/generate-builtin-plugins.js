import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { isValidIdentifier } from "@babel/types";
import camelcase from "camelcase";
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

async function getPluginData(file, pluginFile, getPluginName) {
  const pluginName = getPluginName(pluginFile);
  assert.ok(
    isValidIdentifier(pluginName),
    `Invalid plugin name '${pluginName}'.`,
  );

  const url = new URL(pluginFile, sourceDirectory);

  const implementation = await import(url);

  const pluginData = {
    name: pluginName,
    url,
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
      // If we import `languages` and `options` from the plugin entry
      // It will be much slower to load the Prettier entry
      entries: await locateLanguageOrOptions(pluginData, value, property),
    };
  }

  return pluginData;
}

function getImportStatements(plugins, file) {
  const entries = plugins.flatMap((plugin) =>
    ["languages", "options"].flatMap(
      (property) => plugin[property]?.entries ?? [],
    ),
  );
  return sortByUrl(entries)
    .map(
      (entry) => outdent`
        import ${entry.specifier === "default" ? "" : "* as "}${entry.variableName} from "${getImportSource(file, entry.url)}";
      `,
    )
    .join("\n");
}

function getPluginExportStatement(plugin, file) {
  const properties = {
    name: JSON.stringify(plugin.name),
    importPlugin: `() => import("${getImportSource(file, plugin.url)}")`,
  };

  for (const property of ["options", "languages"]) {
    if (!plugin[property]) {
      continue;
    }
    const variableNames = plugin[property].entries.map(
      ({ variableName }) => variableName,
    );
    const isArray = property === "languages";
    properties[property] =
      variableNames.length === 1
        ? variableNames
        : `${isArray ? "[" : "{"}${variableNames.map((variableName) => `...${variableName},`).join("")}${isArray ? "]" : "}"}`;
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

  const code = outdent`
    /*
    Generated file, do NOT edit
    Run \`${buildScript}\` to regenerate
    */

    ${getImportStatements(plugins, file)}
    import {toLazyLoadPlugin} from "./utilities.js";


    ${sortByUrl(plugins)
      .map((plugin) => getPluginExportStatement(plugin, file))
      .join("\n")}
  `;

  const formatted = await format(code, { parser: "meriyah" });

  await fs.writeFile(file, formatted);
}

async function collectLanguagesAndOptions() {
  const data = await Array.fromAsync(
    fs.glob(["language-*/{languages,languages.evaluate,options}.js"], {
      cwd: sourceDirectory,
    }),
    async (file) => {
      const url = new URL(file, sourceDirectory);
      let implementation = await import(url);

      let specifier = "*";
      if (Object.hasOwn(implementation, "default")) {
        specifier = "default";
        implementation = implementation.default;
      }

      const kind = Array.isArray(implementation) ? "languages" : "options";
      const languageName = path.dirname(file).slice("language-".length);

      return {
        kind,
        url,
        specifier,
        implementation,
        variableName: camelcase(`${languageName}-${kind}`),
      };
    },
  );

  return data;
}

let languagesAndOptions;
async function locateLanguageOrOptions(pluginData, value, kind) {
  languagesAndOptions ??= await collectLanguagesAndOptions();
  const directImport = languagesAndOptions.find(
    (data) => data.kind === kind && data.implementation === value,
  );
  if (directImport) {
    return [directImport];
  }

  if (pluginData.name === "estree" && kind === "languages") {
    const entries = languagesAndOptions.filter(
      (data) =>
        data.kind === kind &&
        (data.variableName === camelcase(`js-${kind}`) ||
          data.variableName === camelcase(`json-${kind}`)),
    );

    const languages = entries
      .flatMap((entry) => entry.implementation)
      .toSorted((languageA, languageB) =>
        languageA.name.localeCompare(languageB.name),
      );
    assert.equal(languages.length, value.length);
    const sorted = value.toSorted((languageA, languageB) =>
      languageA.name.localeCompare(languageB.name),
    );
    for (const [index, language] of languages.entries()) {
      assert.equal(language, sorted[index]);
    }

    return entries;
  }

  throw new Error(
    `Can not locate '${kind}' entry for plugin '${pluginData.name}'.`,
  );
}

function sortByUrl(array) {
  return array.toSorted((elementA, elementB) =>
    elementA.url.href.localeCompare(elementB.url.href),
  );
}

await Promise.all(pluginFiles.map((plugins) => buildPlugins(plugins)));
