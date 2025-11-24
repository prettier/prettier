#### Fix custom element formatting in HTML template literals (#XXXX by @mohamedsaiedd)

Custom elements (web components with hyphens in their names) are now formatted correctly in HTML template literals, with opening brackets on the same line as the tag name.

<!-- prettier-ignore -->
```js
// Input
let test = html`<my-element><my-child></my-child></my-element>`;

// Prettier stable
let test = html`<my-element
  ><my-child></my-child
></my-element>`;

// Prettier main
let test = html`<my-element>
  <my-child></my-child>
</my-element>`;
```
