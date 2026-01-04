/**
@typedef {{
  name: string,
  load: () => Promise<any>,
  options?: any,
  languages?: any[],
  parsers?: string[],
  printers?: string[],
}} PluginInformation
*/

/**
@param {PluginInformation} param0
*/
function toLazyLoadPlugin({
  name,
  load,
  options,
  languages,
  parsers: parserNames,
  printers: printerNames,
}) {
  const plugin = { name };
  if (options) {
    plugin.options = options;
  }

  if (languages) {
    plugin.languages = languages;
  }

  for (const { property, names } of [
    { property: "parsers", names: parserNames },
    { property: "printers", names: printerNames },
  ]) {
    if (names) {
      plugin[property] = Object.fromEntries(
        names.map((name) => [
          name,
          process.env.NODE_ENV === "production"
            ? async () => {
                const loaded = await load();
                Object.assign(plugin, loaded);
                return loaded[property][name];
              }
            : async () => {
                const loaded = await load();
                // Hide `estree` printer in js plugin
                plugin[property] = loaded[property];
                return loaded[property][name];
              },
        ]),
      );
    }
  }

  return plugin;
}

/**
@param  {...PluginInformation} plugins
*/
function toLazyLoadPlugins(...plugins) {
  return plugins.map((plugin) => toLazyLoadPlugin(plugin));
}

export { toLazyLoadPlugins };
