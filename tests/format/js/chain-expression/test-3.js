function getLanguageByInterpreter(languages, file) {
  if (
    process.env.PRETTIER_TARGET === "universal" ||
    !file ||
    getFileBasename(file).includes(".")
  ) {
    return;
  }

  const interpreter = getInterpreter(file);

  if (!interpreter) {
    return;
  }

  return languages.find(
    (language) => language.interpreters?.includes(interpreter),
  );
}
