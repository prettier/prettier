function createParsers(modules) {
  if (!modules) {
    return;
  }

  const parsers = Object.create(null);

  for (const { importPlugin, parserNames } of modules) {
    for (const parserName of parserNames) {
      parsers[parserName] = async () => {
        const {
          default: { parsers: pluginParsers },
        } = await importPlugin();
        return Object.assign(parsers, pluginParsers)[parserName];
      };
    }
  }

  return parsers;
}

export default createParsers;
