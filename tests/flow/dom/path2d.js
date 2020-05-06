// @flow

let tests = [
  // constructors
  function() {
    let path1 = new Path2D(); // valid
    let path2 = new Path2D(path1); // valid
    let path3 = new Path2D('M10 10 h 80 v 80 h -80 Z'); // valid
  },

  // arcTo
  function() {
    let path = new Path2D();
    (path.arcTo(0, 0, 0, 0, 10): void); // valid
    (path.arcTo(0, 0, 0, 0, 10, 20, 5): void); // valid
    (path.arcTo(0, 0, 0, 0, 10, '20', 5): void); // invalid
  },
];
