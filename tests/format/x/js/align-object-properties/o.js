o = {
  [name]: 'value',
  2:3,
  "k-2":2,
  keyasdf:3
}

o = {
  [namelonglonglong]: 'value',
  2:3,
  "k-2":2,
  keyasdf:3
}

// with shorthand member:
o = {
  shorthand,
  [namelonglonglong]: 'value',
  2:3,
  "k-2":2,
  keyasdf:3
}

// with extra-long shorthand member:
o = {
  extraLongShorthand,
  [name]: 'value',
  2:3,
  "k-2":2,
  keyasdf:3
}

// Ensure this object does not get extra padding:
o = { [name]: 'value', 2:3, "k-2":2, keyasdf:3 }

// Ensure this also does not get extra padding:
o = { [name]: 'value', 2:3, "k-2":2,
  keyasdf:3
}

// Ensure this one *does* get the padding:
o = { // with a comment here
  [name]: 'value',
  2:3,
  "k-2":2,
  keyasdf:3
}

// with multiple entries on a single line in the input:
o = {
  [namelonglonglong]: 'value',
  2:3, "k-2":2, keyasdf:3
}

// longer object on a single line:
o = { [namelonglonglong]: 'value', 2:3, "k-2":2, keyasdf:3 }

// with nested object member:
o = {
  [name]: 'value',
  2:3,
  "k-2":2,
  nested: {
    a:1,
    next:2
  },
  keyasdf:3
}

// with nested object member on a single line
// (which should not get extra padding):
o = {
  [name]: 'value',
  2:3,
  "k-2":2,
  nested: { a:1, next:2 },
  keyasdf:3
}

// with nested object member which is reformatted onto single line
// (which should not get extra padding):
o = {
  [name]: 'value',
  2:3,
  "k-2":2,
  nested: {a:1,
    next:2},
  keyasdf:3
}
