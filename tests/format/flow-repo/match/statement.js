{
  declare const x: empty;
  match (x) {}; // OK
}

declare const x: 1 | 2;

match (x) {
  1 => {}
  2 => {}
}

function f1() {
  match (x) {
    1 => {
      throw 0;
    }
    2 => {
      throw 0;
    }
  };
  x; // ERROR: unreachable
}

// Throws in guards
function f2() {
  declare function invariant(boolean): empty;

  match (x) {
    1 => {}
    2 if (invariant(false)) => {}
  };

  x; // OK: not unreachable
}

// Nested matches
{
  match (x) {
    1 => {}
    const a => {
      match (a) {
        _ => {}
      }
    }
  }
}

// Body makes refinements
{
  let target;
  match (x) {
    1 => {
      target = "foo";
    }
    2 => {
      target = true;
    }
  }

  target as string | boolean; // OK
}
{
  let target;
  match (x) {
    const a => {
      target = "foo" as const;
    }
  }
  a; // ERROR

  target as "foo"; // OK
}
{
  declare const x: [number] | number;
  let target = null;
  match (x) {
    [const a] => {
      target = "foo";
    }
    const a => {
      target = true;
    }
  }
  a; // ERROR

  target as string | boolean; // OK
}
{
  let target;
  match (x) {
    1 => {
      target = "foo";
    }
    2 => {
      throw 0;
    }
  }

  target as string; // OK
}
{
  declare const o: {prop: number};
  match (x) {
    1 => {
      o.prop = 1;
    }
    2 => {
      o.prop = 2;
    }
  }

  o.prop as 1 | 2; // OK
}
{
  const a = [];
  match (x) {
    1 => {
      a.push(1);
    }
    2 => {
      a.push(2);
    }
  }

  a as Array<number>; // OK
}

// Abnormal exits functions
function t1(): boolean {
  match (x) {
    1 => {
      return true;
    }
    2 => {
      return false;
    }
  }
}

function t2(): boolean {
  match (x) {
    1 => {
      throw 0;
    }
    2 => {
      return false;
    }
  }
}

// Abnormals in loops
{
  for (let i = 0; i < 2; i++) {
    match (i) {
      0 => {
        break;
      }
      _ => {}
    }
  }
}
{
  label: for (let i = 0; i < 2; i++) {
    match (i) {
      0 => {
        break label;
      }
      _ => {}
    }
  }
}

// // Invalid case body
// function t3() {
//   match (x) {
//     1 => return 1; // ERROR
//     2 => throw false; // ERROR
//   }
// }
