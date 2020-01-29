/**
 * @flow
 */

function testArray(arr: Array<number>): void {
  for (var x of arr) {
    (x: string); // Error - number ~> string
  }
}

function testIterable1(iterable: Iterable<number>): void {
  for (var x of iterable) {
    (x: string); // Error - number ~> string
  }
}

function testIterable2(iterable: Iterable<*>): void {
  for (var x of iterable) {
    (x: string);
  }
}

function testString(str: string): void {
  for (var x of str) {
    (x: number); // Error - string ~> number
  }
}

function testMap1(map: Map<string, number>): void {
  for (var elem of map) {
    (elem: [string, number]);
    (elem: number); // Error - tuple ~> number
  }
}

function testMap2(map: Map<*, *>): void {
  for (var elem of map) {
    (elem: [number, string]); // Any tuple is fine
    (elem: number); // Error - tuple ~> number
  }
}

function testSet1(set: Set<string>): void {
  for (var x of set) {
    (x: number); // Error - string ~> number
  }
}

function testSet2(set: Set<*>): void {
  for (var x of set) {
    (x: number); // Anything goes
  }
}

declare var funky1 : { @@iterator(): $Iterator<string, number, boolean> };
declare var funky2 : { @@iterator(): $Iterator<() => {}, empty, mixed> };
declare var funky3 : { @@iterator(): $Iterator<?typeof funky2, mixed, void> };
declare var funky4 : { @@iterator(): $Iterator<void, null, void> };
function *funky() {
  yield 0;
  yield true;
  return "";
}

for (var x of funky1) {
  x = x * 3; // error
}

for (var x of funky2) {
  x();
}

for (var x of funky3) {
  if (!x) continue;
  for (var y of x) {
    y();
  }
}

for (var x of funky4) {
  (x : void)
}

for (var x of funky()) {
  (x : number); // error
  (x : boolean); // error
  (x : string) //error
}
