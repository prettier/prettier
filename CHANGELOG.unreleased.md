- LWC: Add support for Lightning Web Component ([#5800] by [@ntotten])

  Supports Lightning Web Component (LWC) template format for HTML attributes by adding a new parser called `lwc`.

  ```
  // Input
  <my-element data-for={value}></my-element>

  // Output (Prettier stable)
  <my-element data-for={value}></my-element>

  // Output (Prettier master)
  <my-element data-for={value}></my-element>
  ```
