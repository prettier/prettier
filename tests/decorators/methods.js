
class Yo {
  @foo("hello")
  async plop() {}

  @anotherDecoratorWithALongName("and a very long string as a first argument")
  async plip() {}
}

class Bar{
  @outer(
    @classDec class { 
      @inner 
      innerMethod() {} 
    }
  )
  outerMethod() {}
}

class Foo {
  @dec
  static bar() {}
}

class A {
  @a.b.c.d(e, f)
  m(){}
}

class A {
  @dec
  ['name'](){}
}

class A {
  @dec *m(){}
}
