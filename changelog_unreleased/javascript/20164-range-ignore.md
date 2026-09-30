#### Respect ignore comments immediately before a formatting range (#PR_NUMBER by @davidscottpope-gif)

Range formatting now respects `prettier-ignore` comments before the selected statement,
including when the selected range is inside an ignored statement. JavaScript, Flow, and
TypeScript are covered by regression tests.

<!-- prettier-ignore -->
```jsx
// Input (--parser typescript --range-start 19 --range-end 42)
// prettier-ignore
const a  =  [1,2,   3];

// Prettier stable
// prettier-ignore
const a = [1, 2, 3];

// Prettier main
// prettier-ignore
const a  =  [1,2,   3];
```
