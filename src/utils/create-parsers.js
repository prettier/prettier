function createParsers(modules) {
  /* c8 ignore start */
  if (!modules) {
    return;
  }
  /* c8 ignore end */

  const parsers = Object.create(null);

  for (const { importPlugin, parserNames } of modules) {
    for (const parserName of parserNames) {
      parsers[parserName] = async () => {
        const plugin = await importPlugin();
        return Object.assign(parsers, plugin.parsers)[parserName];
      };
    }
  }

  return parsers;
}

export default createParsers;
