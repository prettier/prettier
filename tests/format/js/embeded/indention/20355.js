html`
  <html>
    <body>
      <form>
        <textarea>
${Match.valueTags(form, {
  EmptyForm: () => '',
  InvalidForm: () => '',
  CompletedForm: () => '',
})}</textarea>
      </form>
    </body>
  </html>
`;

html`
  <div>
    <pre>
  x
    ${foo({
      a,
    })}</pre
    >
  </div>
`;

html`
  <div>
    <textarea>
  x ${foo({
    a,
  })}</textarea
    >
  </div>
`;
