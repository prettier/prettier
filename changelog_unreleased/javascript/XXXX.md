#### Track cursor position properly when it’s at the end of the range to format (#XXXX by @j-f1)

Previously, if the cursor was at the end of the range to format, it would simply be placed back at the end of the updated range.
Now, it will be repositioned if Prettier decides to add additional code to the end of the range (such as a semicolon).

<!-- prettier-ignore -->
```jsx
// Input (<|> represents the cursor)
const someVariable = myOtherVariable<|>
// range to format:  ^^^^^^^^^^^^^^^

// Prettier stable
const someVariable = myOtherVariable;<|>
// range to format:  ^^^^^^^^^^^^^^^

// Prettier main
const someVariable = myOtherVariable<|>;
// range to format:  ^^^^^^^^^^^^^^^
```
