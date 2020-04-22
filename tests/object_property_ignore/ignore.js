foo = {
  // prettier-ignore
  bar:            1,
}

foo = {
  _: '',
  // prettier-ignore
  bar:            1,
}

/* comments */
foo = {
  _: '',
  // prettier-ignore
  bar:            1,         // comment
}

foo = {
  _: '',
  // prettier-ignore
  bar:            1,         /* comment */
}

foo = {
  _: '',
  // prettier-ignore
  bar:            /* comment */          1,
}

/* RestElement */
foo = {
  _: '',
  // prettier-ignore
  ...bar,
}
