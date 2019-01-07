// Needs to be at the top but belongs to object-curly-spacing
import { foo } from 'bar'

// Needs to be at the top but belongs to indent rule
import {
  foosjdfhalsjkdhflasjdhfajashdlfjahsdlfjashdlfjaksdsadfaso,
  barsjdfhalsjkdhflasjdhfajashdlfjahsdlfjashdlfjaksdsadfaso,
  bazsjdfhalsjkdhflasjdhfajashdlfjahsdlfjashdlfjaksdsadfaso
} from 'qux'

// "arrow-spacing": ["error", { "before": true, "after": true }]
a => {}
;() => {}
a => a
;() => {
  '\n'
}

// "block-spacing": [ "error", "always" ],
function foo () {
  return true
}
if (foo) {
  bar = 0
}

// "brace-style": [ "error", "1tbs", { "allowSingleLine": true } ],
function foo () {
  return true
}
if (foo) {
  bar()
}
if (foo) {
  bar()
} else {
  baz()
}
try {
  somethingRisky()
} catch (e) {
  handleError()
}

// "comma-spacing": [ "error", { "before": false, "after": true } ],
var foo = 1
var baz = 3
var arr = [1, 2]
var arr = [1, , 3]
var obj = { foo: 'bar', baz: 'qur' }
foo(a, b)
new Foo(a, b)
function foo (a, b) {}
a, b

// "eol-last": "error",
// cannot be tested here, but true (Unix-style new lines)

// "func-call-spacing": [ "error", "never" ],
fn()

// "generator-star-spacing": [ "error", { "before": true, "after": true } ],
function * generator () {}
var anonymous = function * () {}
var shorthand = { * generator () {} }
class Example {
  async * foo () {}
}

// "indent": [
//   "error",
//   2,
//   {
//     "SwitchCase": 1,
//     "VariableDeclarator": 1,
//     "outerIIFEBody": 1,
//     "MemberExpression": 1,
//     "FunctionDeclaration": { "parameters": 1, "body": 1 },
//     "FunctionExpression": { "parameters": 1, "body": 1 },
//     "CallExpression": { "arguments": 1 },
//     "ArrayExpression": 1,
//     "ObjectExpression": 1,
//     "ImportDeclaration": 1,
//     "flatTernaryExpressions": false,
//     "ignoreComments": false
//   }
// ],

switch (a) {
  case 'a':
    break
  case 'b':
    break
}

var aajshdfaljskdhflakjshdflkjashdlfjkhasldkjfhlasjkdfhlaskjdhfalsjkdfha,
  bajshdfaljskdhflakjshdflkjashdlfjkhasldkjfhlasjkdfhlaskjdhfalsjkdfha,
  bajshdfaljskdhflakjshdflkjashdlfjkhasldkjfhlasjkdfhlaskjdhfalsjkdfha
let aajshdfaljskdhflakjshdflkjashdlfjkhasldkjfhlasjkdfhlaskjdhfalsjkdfha,
  bajshdfaljskdhflakjshdflkjashdlfjkhasldkjfhlasjkdfhlaskjdhfalsjkdfha,
  bajshdfaljskdhflakjshdflkjashdlfjkhasldkjfhlasjkdfhlaskjdhfalsjkdfha
const a = 1
const b = 2
const c = 3
;(function () {
  function foo (x) {
    return x + 1
  }
})()
if (y) {
  console.log('foo')
}
function foo (
  barverylongverylongverylongverylongverylongverylongverylongverylong,
  bazverylongverylongverylongverylongverylongverylongverylongverylong,
  quxverylongverylongverylongverylongverylongverylongverylongverylong
) {
  qux()
}
foo(
  barverylongverylongverylongverylongverylongverylongverylongverylong,
  bazverylongverylongverylongverylongverylongverylongverylongverylong,
  quxverylongverylongverylongverylongverylongverylongverylongverylong
)
var foo = [
  barverylongverylongverylongverylongverylongverylongverylongverylong,
  bazverylongverylongverylongverylongverylongverylongverylongverylong,
  quxverylongverylongverylongverylongverylongverylongverylongverylong
]
var foo = {
  barverylongverylongverylongverylongverylongverylongverylongverylong: 1,
  bazverylongverylongverylongverylongverylongverylongverylongverylong: 2,
  quxverylongverylongverylongverylongverylongverylongverylongverylong: 3
}
var a = barverylongverylongverylongverylongverylongverylongverylongverylong
  ? bar
  : barverylongverylongverylongverylongverylongverylongverylongverylong

// "key-spacing": [ "error", { "beforeColon": false, "afterColon": true } ],
var obj = { foo: 42 }

// "keyword-spacing": [ "error", { "before": true, "after": true } ],
if (foo) {
  // ...
} else if (bar) {
  // ...
} else {
  // ...
}

// "no-multi-spaces": "error",
var a = 1
if (foo === 'bar') {
}
a << b
var arr = [1, 2]
a ? b : c

// "no-multiple-empty-lines": [ "error", { "max": 1, "maxEOF": 0 } ],
// cannot be tested here, but true

// "no-trailing-spaces": "error",
// cannot be tested here, but true

// "no-whitespace-before-property": "error",
foo.bar
foo[bar]
foo.bar.baz
foo.bar().baz()

// "object-curly-spacing": [ "error", "always" ],
var obj = {}
var obj = { foo: 'bar' }
var obj = { foo: { bar: 'baz' }, qux: 'quxx' }
var obj = {
  foo: 'bar'
}
var { x } = y

// "object-property-newline": [ "error", { "allowMultiplePropertiesPerLine": true } ],
const obj = { foo: 'foo', bar: 'bar' }
const obj2 = {
  foo: 'foo',
  bar: 'bar',
  baz: 'baz'
}
const user = process.argv[2]
const obj3 = {
  user,
  [process.argv[3] ? 'foo' : 'bar']: 0,
  baz: [1, 2, 4, 8]
}

// "padded-blocks": [ "error", { "blocks": "never", "switches": "never", "classes": "never" } ],
if (a) {
  b()
}
if (a) {
  b()
}
class A {
  constructor () {
    // ...
  }
}
switch (a) {
  case 0:
    foo()
}

// "rest-spread-spacing": [ "error", "never" ],
fn(...args)
function fn (...args) {
  console.log(args)
}
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 }
let n = { x, y, ...z }

// "semi-spacing": [ "error", { "before": false, "after": true } ],
for (;;) {}

// "space-before-blocks": [ "error", "always" ],
if (a) {
  b()
}
if (a) {
  b()
} else {
  c()
}
function a () {}
for (;;) {
  b()
}
try {
} catch (a) {}

// "space-before-function-paren": [ "error", "always" ],
function foo () {
  // ...
}

var bar = function () {
  // ...
}

var bar = function foo () {
  // ...
}

class Foo {
  constructor () {
    // ...
  }

  get foo () {
    // ...
  }

  set bar (param) {
    // ...
  }
}

var foo = {
  bar () {
    // ...
  }
}

var foo = async () => 1

// "space-in-parens": [ "error", "never" ],
foo()

foo('bar')

var foo = (1 + 2) * 3
;(function () {
  return 'bar'
})()

// "space-infix-ops": "error",
a + b
a + b
a ? b : c
const a = { b: 1 }
var { a = 0 } = bar
function foo (a = 0) {}

// "space-unary-ops": [ "error", { "words": true, "nonwords": false } ],
delete foo.bar
new Foo()
void 0
;-foo
;+'3'
++foo
foo--

// "spaced-comment": [
//   "error",
//   "always",
//   {
//     "line": { "markers": [ "*package", "!", "/", ",", "=" ] },
//     "block": {
//       "balanced": true,
//       "markers": [ "*package", "!", ",", ":", "::", "flow-include" ],
//       "exceptions": [ "*" ]
//     }
//   }
// ],

/* eslint spaced-comment: ["error", "always"] */
// This is a comment with a whitespace at the beginning
/* This is a comment with a whitespace at the beginning */
/*
 * This is a comment with a whitespace at the beginning
 */
/*
This comment has a newline
*/

// "template-curly-spacing": [ "error", "never" ],
;`hello, ${people.name}!`
;`hello, ${
  people.name.some.long.property.that.cannot.fit.in[80].characters.limit.for
    .prettier
}!`

// "template-tag-spacing": [ "error", "never" ],
func`Hello world`

// "unicode-bom": [ "error", "never" ],
var abc

// "yield-star-spacing": [ "error", "both" ]
function * generator () {
  yield * other()
}

// "jsx-quotes": ["error", "prefer-single"],
;() => <div foo='bar' />
