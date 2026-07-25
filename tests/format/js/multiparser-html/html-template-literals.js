const nestedFun = /* HTML */ `${outerExpr(1)}
  <script>
    const tpl = html\`<div>\${innerExpr(1)} ${outerExpr(2)}</div>\`;
  </script>`;

const nestedFun2 = /* HTML */ `${outerExpr(1)}
  <script>
    const tpl = html\`\\n<div>\${innerExpr(1)} ${outerExpr(2)}</div>\\n\`;
  </script>`;

setFoo(
  html`<div>one</div>
    <div>two</div>
    <div>three</div>`,
  secondArgument
);

setFoo(
  html`<div>
      <div>nested</div>
    </div>
    <div>two</div>
    <div>three</div>`,
  secondArgument
);

setFoo(
  html`<div>
    <div>nested</div>
  </div>`,
  secondArgument
);

// Attribute quotes
a = /* HTML */ `<div
    double-quoted="${foo}"
single-quoted='${foo}'
        unquoted=${foo}>   </div>
`
a = /* HTML */ `<div
    style="${foo}"
style='${foo}'
        style=${foo}>   </div>
`

const list = html`
  <ol>
    ${items.map(
      (entry) => html`
        <li>
          ${entry.children
            ? html`
                <ol>
                  ${entry.children.map(
                    (child) => html`<li>${child.title}</li>`,
                  )}
                </ol>
              `
            : entry.title}
        </li>
      `,
    )}
  </ol>
`;

const pre = html`
  <div>
    <pre>${JSON.stringify({
      a: 1,
      b: 2,
    })}</pre>
  </div>
`;
