function getLanguageByInterpreter(languages, file) {
  return languages.find(
    (language) => language.interpreters?.includes(interpreter),
  );
}
