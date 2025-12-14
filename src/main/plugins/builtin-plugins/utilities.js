/**
@param {{
  importPlugin: () => Promise<any>,
  options?: any,
  languages?: any[],
  parserNames?: string[],
  printerNames?: string[],
}} param0
@returns
*/

function toLazyLoadPlugin({
  importPlugin,
  options,
  languages,
  parserNames = [],
  printerNames = [],
}) {
  const parsers = Object.create(null);
  const printers = Object.create(null);

  const loadPlugin = async () => {
    const plugin = await importPlugin();
    Object.assign(parsers, plugin.parsers);
    Object.assign(printers, plugin.printers);
    return plugin;
  };

  for (const parserName of parserNames) {
    parsers[parserName] = async () => (await loadPlugin()).parsers[parserName];
  }

  for (const printerName of printerNames) {
    printers[printerName] = async () =>
      (await loadPlugin()).printers[printerName];
  }

  return {
    options,
    languages,
    parsers,
    printers,
  };
}

export { toLazyLoadPlugin };
