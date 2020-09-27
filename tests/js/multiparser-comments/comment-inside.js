html`${
      foo
  /* comment */
}`;
html`
${
      foo
  /* comment */
}
`;
// #9274
html`
  <div>
    ${this.set && this.set.artist
    /* avoid console errors if `this.set` is undefined */}
  </div>
`;