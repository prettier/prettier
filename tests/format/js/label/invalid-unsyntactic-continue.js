// https://github.com/tc39/test262/blob/d86b2294eb0a17eaa281ff12c73c473ec864c72f/test/language/statements/block/labeled-continue.js#L20-L24

label: {
  for ( ;; ) {
    continue label;
  }
}
