// no-confusing-arrow
var x = a => 1 ? 2 : 3;
var x = a <= 1 ? 2 : 3;

a = () => 1 ? [] : [];
a = () => long_long_long_long_long_long_long_long_long_long_long_condition ? [] : [];

b = () => () => condition ? result1 : result2;
b = () => () => () => test ? value1 : value2;

c = () => ({}) ? result1 : result2;
