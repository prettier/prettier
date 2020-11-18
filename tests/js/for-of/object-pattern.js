// #9287
for({a: {b}} of c){}

// Line breaks
for({
a: {b}} of c){}

for({a: {
b}} of c){}

for({
a: {
b}} of c){}

// Comments
for({
// comment
a: {b}} of c){}

for({a: {
// comment
b}} of c){}

// VariableDeclarator
for(const {a: {b}} of c){}
for(var {a: {b}} of c){}
for(let {a: {b}} of c){}

// Multiple properties
for({a: {b}, d} of c){}
for({a: {b, d}} of c){}

// Default value
for({a: {b} = d} of c){}
for({a: {b = d}} of c){}
for({a = {a: {b: 'b'}}} of c){}
for({a: {b = {b: {d: 'd'}}}} of c){}

// Long
for({a_very_very_long_very_very_long_very_very_long_very_very_long_very_very_long_property: {b}} of c){}
for({a: {a_very_very_long_very_very_long_very_very_long_very_very_very_very_long_long_property}} of c){}
