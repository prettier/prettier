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

// Ensure this object does not get extra padding:
o = { [name]: 'value', 2:3, "k-2":2, keyasdf:3 }
