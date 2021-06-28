type IdentityWrapper = {
  func <T>(T) :T
}

function identity <T>(value :T) :T {
  return value
}

interface Foo <T>{
  getter(value:T):T
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
