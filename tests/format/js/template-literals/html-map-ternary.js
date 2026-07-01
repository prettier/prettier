const t = html`
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
