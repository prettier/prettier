#### Fix unstable line comment after `case …:` before a block (#XXXX by @jamalkamaladdin)

<!-- prettier-ignore -->
```jsx
// Input
switch (a) { case 1: // c
{ b; } }

// Prettier stable (First format)
switch (a) {
  case 1: { // c
    b;
  }
}

// Prettier stable (Second format)
switch (a) {
  case 1: {
    // c
    b;
  }
}

// Prettier main
switch (a) {
  case 1: {
    // c
    b;
  }
}
```
