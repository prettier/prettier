function outer() {
  function* inner() {
    <<<PRETTIER_RANGE_START>>>yield [1, 2];<<<PRETTIER_RANGE_END>>>
  }
}
