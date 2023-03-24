function createParsers(modules) {
  const parsers = Object.create(null);

  for (const { importParsers, parserNames } of modules) {
    for (const parserName of parserNames) {
      parsers[parserName] = async () =>
        Object.assign(parsers, await importParsers())[parserName];
    }
  }

  return parsers;
}

export default createParsers;
