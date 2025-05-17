#### Fix starred block comments in JSX expressions (TBD by @wchargin)

<!-- prettier-ignore -->
```jsx
// Input
<div>
  {/*
     * starred
      * comment
       */}
</div>;

// Prettier stable
<div>
  {/*
   * starred
   * comment
   */}
</div>;

// Prettier main
<div>
  {/*
    * starred
    * comment
    */}
</div>;
```
