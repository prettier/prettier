while (someVeryLongFunc(someVeryLongArgA, someVeryLongArgB, someVeryLongArgC, someVeryLongArgD)) { }

do { }
while (someVeryLongFunc(someVeryLongArgA, someVeryLongArgB, someVeryLongArgC, someVeryLongArgD));

for (var i = 0, len = arr.length; i < len; i++) { }

(async () => {
  for await (num of asyncIterable) {
    console.log(num);
  }
  for await (const x of delegate_yield()) {
    x;
  }
})();
