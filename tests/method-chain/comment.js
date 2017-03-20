function f() {
  return observableFromSubscribeFunction()
    // Debounce manually rather than using editor.onDidStopChanging so that the debounce time is
    // configurable.
    .debounceTime(debounceInterval);
}

_.a(a)
  /* very very very very very very very long such that it is longer than 80 columns */
  .a()

_.a(
  a
)/* very very very very very very very long such that it is longer than 80 columns */
.a();

_.a(
  a
) /* very very very very very very very long such that it is longer than 80 columns */.a();
