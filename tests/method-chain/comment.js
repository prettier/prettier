function f() {
  return observableFromSubscribeFunction()
    // Debounce manually rather than using editor.onDidStopChanging so that the debounce time is
    // configurable.
    .debounceTime(debounceInterval);
}
