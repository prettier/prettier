- LWC: Adds support for Lighting Web Components in HTML Parser ([#5800] by [@ntotten])

  Supports LWC template format for HTML attributes by adding a new option for the HTML parser called `lwc`.

  ```
  // Input
  <my-element data-for={value}></my-element>

  // Output (Prettier stable)
  <my-element data-for={value}></my-element>

  // Output (Prettier master)
  <my-element data-for={value}></my-element>
  ```
