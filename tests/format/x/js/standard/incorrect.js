// "arrow-spacing": ["error", { "before": true, "after": true }]

()=> {};
() =>{};
(a)=> {};
(a) =>{};
a =>a;
a=> a;
()=> {'\n'};
() =>{'\n'};

// "block-spacing": [ "error", "always" ],

function foo() {return true;}
if (foo) { bar = 0;}
function baz() {let i = 0;
  return i;
}

// "brace-style": [ "error", "1tbs", { "allowSingleLine": true } ],

function foo()
{
  return true;
}

if (foo)
{
  bar();
}

try
{
  somethingRisky();
} catch(e)
{
  handleError();
}

if (foo) {
  bar();
}
else {
  baz();
}

// "comma-spacing": [ "error", { "before": false, "after": true } ],

var foo = 1 ,bar = 2;
var arr = [1 , 2];
var obj = {"foo": "bar" ,"baz": "qur"};
foo(a ,b);
new Foo(a ,b);
function foo(a ,b){}
a ,b

// "eol-last": "error",
// cannot be tested here, but true (Unix-style new lines)

// "func-call-spacing": [ "error", "never" ],
fn ();

fn
();

// "generator-star-spacing": [ "error", { "before": true, "after": true } ],

function* generator() {}
var anonymous = function* () {};
var shorthand = { * generator() {} };
function *generator() {}
var anonymous = function *() {};
var shorthand = { *generator() {} };


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

// "key-spacing": [ "error", { "beforeColon": false, "afterColon": true } ],

var obj = { "foo" : 42 };
var obj = { "foo":42 };

// "keyword-spacing": [ "error", { "before": true, "after": true } ],

if (foo) {
  //...
}else if (bar) {
  //...
}else {
  //...
}

// "no-multi-spaces": "error",

var a =  1;
if(foo   === "bar") {}
a <<  b
var arr = [1,  2];
a ?  b: c

// "no-multiple-empty-lines": [ "error", { "max": 1, "maxEOF": 0 } ],
// cannot be tested here, but true

// "no-trailing-spaces": "error",
// cannot be tested here, but true

// "no-whitespace-before-property": "error",

foo [bar]
foo. bar
foo .bar
foo. bar. baz
foo. bar()
  .baz()
foo
  .bar(). baz()

// "object-curly-spacing": [ "error", "always" ],

var obj = {'foo': 'bar'};
var obj = {'foo': 'bar' };
var obj = { baz: {'foo': 'qux'}, bar};
var obj = {baz: { 'foo': 'qux' }, bar};
var obj = {'foo': 'bar'
};
var obj = {
  'foo':'bar'};
var {x} = y;
import {foo } from 'bar';

// "object-property-newline": [ "error", { "allowMultiplePropertiesPerLine": true } ],

const obj0 = { foo: "foo", bar: "bar", baz: "baz" };
const obj1 = {
  foo: "foo", bar: "bar", baz: "baz"
};
const obj2 = {
  foo: "foo", bar: "bar",
  baz: "baz"
};
const obj3 = {
  [process.argv[3] ? "foo" : "bar"]: 0, baz: [
    1,
    2,
    4,
    8
  ]
};
const a = "antidisestablishmentarianistically";
const b = "yugoslavyalılaştırabildiklerimizdenmişsiniz";
const obj4 = {a, b};
const domain = process.argv[4];
const obj5 = {
  foo: "foo", [
    domain.includes(":") ? "complexdomain" : "simpledomain"
  ]: true};

// "padded-blocks": [ "error", { "blocks": "never", "switches": "never", "classes": "never" } ],


if (a) {

  b();

}

if (a)
{

  b();

}

if (a) {

  b();
}

if (a) {
  b();

}

class  A {

  constructor(){
  }

}

switch (a) {

  case 0: foo();

}

// "rest-spread-spacing": [ "error", "never" ],

fn(... args)
function fn(... args) { console.log(args); }
let { x, y, ... z } = { x: 1, y: 2, a: 3, b: 4 };
let n = { x, y, ... z };

// "semi-spacing": [ "error", { "before": false, "after": true } ],

var foo ;
var foo;var bar;
throw new Error("error") ;
while (a) { break ; }
for (i = 0 ; i < 10 ; i++) {}
for (i = 0;i < 10;i++) {}

// "space-before-blocks": [ "error", "always" ],

if (a){
    b();
}

function a(){}

for (;;){
    b();
}

try {} catch(a){}

class Foo{
  constructor(){}
}

// "space-before-function-paren": [ "error", "always" ],

function foo() {
    // ...
}

var bar = function() {
    // ...
};

var bar = function foo() {
    // ...
};

class Foo {
    constructor() {
        // ...
    }
}

var foo = {
    bar() {
        // ...
    }
};

var foo = async() => 1

// "space-in-parens": [ "error", "never" ],

foo( 'bar');
foo('bar' );
foo( 'bar' );

var foo = ( 1 + 2 ) * 3;
( function () { return 'bar'; }() );

// "space-infix-ops": "error",

a+b
a+ b
a +b
a?b:c
const a={b:1};
var {a=0}=bar;
function foo(a=0) { }

// "space-unary-ops": [ "error", { "words": true, "nonwords": false } ],

typeof!foo;
void{foo:0};
new[foo][0];
delete(foo.bar);
++ foo;
foo --;
- foo;
+ "3";

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

/*eslint spaced-comment: ["error", "always"]*/
//This is a comment with no whitespace at the beginning
/*This is a comment with no whitespace at the beginning */
/* eslint spaced-comment: ["error", "always", { "block": { "balanced": true } }] */
/* This is a comment with whitespace at the beginning but not the end*/

// "template-curly-spacing": [ "error", "never" ],
// (blank line here causes issues with CI for some reason)
`hello, ${ people.name}!`;
`hello, ${people.name }!`;
`hello, ${ people.name }!`;

// "template-tag-spacing": [ "error", "never" ],

func `Hello world`;

// "unicode-bom": [ "error", "never" ],

U+FEFF
var abc;

// "yield-star-spacing": [ "error", "both" ]


function *generator() {
  yield *other();
}
function* generator() {
  yield* other();
}
function*generator() {
  yield*other();
}

// "jsx-quotes": ["error", "prefer-single"],
;() => <div foo="bar" />

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
let isSpace = false
const dress = isSpace ? {
      spaceSuit: 3,
      oxygenCylinders: 6
    } : {
      shirts: 3,
      paints: 3
    }
