#### Keep multiple comments before `=>` on the same line (#XXXX by @costajohnt)

<!-- prettier-ignore -->
```jsx
// Input
const f = (a) /* b */ /* c */ => a;

// Prettier stable
const f = (a) /* b */
/* c */ => a;

// Prettier main
const f = (a) /* b */ /* c */ => a;
```
