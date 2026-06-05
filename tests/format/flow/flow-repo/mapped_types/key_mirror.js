declare function keyMirror<O>(o: O): {[K in keyof O]: K};

var o = keyMirror({
  FOO: null,
  BAR: null,
});

o.FOO as 'FOO'; // ok
o.FOO as 'BAR'; // error, 'FOO' incompatible with 'BAR'
