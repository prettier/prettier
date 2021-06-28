function identity <T>(value :T) :T {
  return value
}

class Example<T> implements Foo <T>{
  value:T;
  getter(value :T) :T {
    return this.value
  }
  set setter(value :T) {
    this.value = value
  }
}
