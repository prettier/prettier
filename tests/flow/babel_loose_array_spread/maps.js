const map1 = new Map();
const map2 = new Map();
new Map([
  ...map1, // Error
  ...map2 // Error
]);
new Map([...Array.from(map1), ...Array.from(map2)]); // No error
f(
  ...map1, // Error
  ...map2 // Error
);
function f(...args) {}
