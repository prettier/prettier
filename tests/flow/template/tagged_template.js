// @flow

let tests = [
  // list of args
  function() {
    function tag(quasis: Array<string>, x: number, y: number) {}
    tag`foo${1}bar${2}`; // ok
    tag`foo${'bad'}bar${2}`; // error: string !~> number
  },

  // wrong arity
  function() {
    function tag(quasis: Array<string>, number) {}
    tag`foo${1}bar${2}`; // error: expected 2 args, got 3
  },

  // rest expr
  function() {
    function tag(quasis: Array<string>, ...exprs: Array<number>) {}
    tag`foo${1}`; // ok
    tag`foo${'bad'}`; // error: string !~> number
  },
]
