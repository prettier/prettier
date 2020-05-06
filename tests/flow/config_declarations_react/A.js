// Due to [declarations], this won't error
const str2str = require('react-native/str2str')

// But this identical one will
const str2str_loud = require('react-d3/str2str')

// Calling str2str with a string is correct
const foo: string = str2str(' bar ');

// But not with a number
const fooNum: number = str2str(39); // Would not error if using [untyped]!

// trim2 should still error as well
str2str(39);