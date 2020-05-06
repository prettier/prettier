/***
 * @flow
 */

// local use of annotated var within catch is ok
function f() {
  try {
  } catch {
    var x:number = 0;
    var y:number = x;
  }
}

// but not across try/catch
function f() {
  try {
    var x:number = 0;
  } catch {
    var y:number = x; // error
  }
}

// it type checks the block correctly and errors
function f() {
  try {
  } catch {
    var y:number = 'string'; // error
  }
}

// scope works
function f() {
  var x: number = 0;
  try {
  } catch {
    var y:string = x; // error
  }
}
