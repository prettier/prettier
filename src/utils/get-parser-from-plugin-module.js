async function getParserFromModule(moduleImportPromise, parserName) {
  return (await moduleImportPromise).default.parsers[parserName]
}

export default getParserFromModule
