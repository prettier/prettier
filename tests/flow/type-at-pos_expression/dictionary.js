// @flow

const d1 = {
  ab: null,
  "a b": null,
  "a'b": null,
  "1": null,
  "'": null,
  " ": null,
  "_": null,
  "": null,
  // TODO
  get "x"() {
    return null;
  },
  set "y"(z: string) {}
};

const d2 = {
  ab: null,
  'a b': null,
  'a"b': null,
  '1': null,
  '"': null,
  ' ': null,
  '_': null,
  '': null,
  // TODO
  get 'x'() {
    return null;
  },
  set 'y'(z: string) {}
};
