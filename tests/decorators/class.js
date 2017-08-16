@foo('bar')
class Foo {}

@abc
class Foo {}

var foo = @dec class Bar {
  @baz
  bam() {
    f();
  }
}

@outer({
  store: @inner class Foo {}
})
class Bar {
  
}
