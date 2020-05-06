/* @flow */
function foo(x:string) { }

var a = [0];
var b = a.map(function (x) { foo(x); return "" + x; });

var c: number = a[0];
var d: number = b[0];

var e:Array<string> = a.reverse();

var f = [""];
var g:number = f.map(function () { return 0; })[0];

var h: Array<number> = [1,2,3];
var i: Array<string> = ['a', 'b', 'c'];
var j: Array<number | string> = h.concat(i);
var k: Array<number> = h.concat(h);
var l: Array<number> = h.concat(1,2,3);
var m: Array<number | string> = h.concat('a', 'b', 'c');
var n: Array<number> = h.concat('a', 'b', 'c'); // Error

function reduce_test() {
  /* Adapted from the following source:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
   */
  [0, 1, 2, 3, 4].reduce(function(previousValue, currentValue, index, array) {
    return previousValue + currentValue + array[index];
  });

  [0, 1, 2, 3, 4].reduce(function(previousValue, currentValue, index, array) {
    return previousValue + currentValue + array[index];
  }, 10);

  var total = [0, 1, 2, 3].reduce(function(a, b) {
    return a + b;
  });

  var flattened = [[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
    return a.concat(b);
  });

  /* Added later, because the above is insufficient */

  // acc is element type of array when no init is provided
  [""].reduce((acc, str) => acc * str.length); // error, string ~> number
  [""].reduceRight((acc, str) => acc * str.length); // error, string ~> number
}

function from_test() {
  var a: Array<string> = Array.from([1, 2, 3], function(val, index) {
    return index % 2 ? "foo" : String(val);
  });
  var b: Array<string> = Array.from([1, 2, 3], function(val) {
    return String(val);
  });
}

function of_test() {
  var emptyArrayOkay: Array<empty> = Array.of();
  var exactMatchOkay: Array<string> = Array.of("hello", "world");
  var upcastOkay: Array<string | number> = Array.of("hello", "world");
  var incompatibleTypeNotOkay: Array<string> = Array.of(1, 2);
}

function flatMap_test() {
  /* Adapted from the following source:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
   */
  function case1() {
    let arr1 = [1, 2, 3, 4];

    let arr2 = arr1.map(x => [x * 2]); // [[2], [4], [6], [8]]

    let arr3: Array<number> = arr1.flatMap(x => [x * 2]); // [2, 4, 6, 8]

    // only one level is flattened
    let arr4: Array<Array<number>> = arr1.flatMap(x => [[x * 2]]); // [[2], [4], [6], [8]]
  }
  function case2() {
    let arr1 = ["it's Sunny in", "", "California"];

    let arr2 = arr1.map(x => x.split(" "));
    // [["it's","Sunny","in"],[""],["California"]]

    let arr3: Array<string> = arr1.flatMap(x => x.split(" "));
    // ["it's","Sunny","in", "", "California"]
  }
  function case3() {
    // Let's say we want to remove all the negative numbers and split the odd numbers into an even number and a 1
    let arr1 = [5, 4, -3, 20, 17, -33, -4, 18];
    //       |\  \  x   |  | \   x   x   |
    //      [4,1, 4,   20, 16, 1,       18]

    let arr2: Array<number> = arr1.flatMap(n =>
      n < 0 ? [] : n % 2 == 0 ? [n] : [n - 1, 1]
    );

    // expected output: [4, 1, 4, 20, 16, 1, 18]
  }
  function case4() {
    let arr1 = [5, 2, 3, 4];
    let arr2: Array<number | string> = arr1.flatMap(n => (n < 0 ? [1, 2, 3] : "ok"));

    let arr3: $ReadOnlyArray<number> = [5, 2, 3, 4];
    let arr4: Array<number | string> = arr3.flatMap(n => (n < 0 ? [1, 2, 3] : "ok"));
  }
  function case5() {
    let arr1: $ReadOnlyArray<number> = [5, 2, 3, 4];
    let arr2: Array<number> = arr1.flatMap(n => {
      const r: $ReadOnlyArray<number> = [1, 2, 3];
      return r;
    });
  }
}
