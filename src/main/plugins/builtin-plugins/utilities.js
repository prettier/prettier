/**
@param {{
  name: string,
  importPlugin: () => Promise<any>,
  options?: any,
  languages?: any[],
  parserNames?: string[],
  printerNames?: string[],
}} param0
@returns
*/

function toLazyLoadPlugin({
  name,
  importPlugin,
  options,
  languages,
  parserNames,
  printerNames,
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
                const loaded = await importPlugin();
                Object.assign(plugin, loaded);
                return loaded[property][name];
              }
            : async () => {
                const loaded = await importPlugin();
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

export { toLazyLoadPlugin };
