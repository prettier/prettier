// @flow

() => ({
  ab: null, "a b": null, "a'b": null,
  "1": null, "'": null, " ": null,
  "_": null, "": null,
  get "x"() {return null; },
  set "y"(z: string) {}});

() => ({
  ab: null, 'a b': null, 'a"b': null, '1': null, '"': null, ' ': null, '_': null, '': null,
  get 'x'() {return null;}, set 'y'(z: string) {} } );
