this._pipe.write(`\n\n Pattern matches ${total} ${pluralizeTest}`);
this._pipe.write(
  `\n\n Pattern matches ${total} ${pluralizeTest}`
);
this._pipe
  .write(
    `\n\n Pattern matches ${total} ${pluralizeTest}`
  );

this._pipe.write(`\n\n Pattern matches ${total} ${pluralizeTest} but that's long`);

this._pipe.write(
  `\n\n Pattern matches ${total} ${pluralizeTest} but that's long`
);

this._pipe.write(`
  \n\n Pattern matches ${total} ${pluralizeTest} but that's long
`);


() => `
  a
`;

() =>
  `
    a
  `;

(): {
  someLong: boolean,
  t: boolean
} => `
  a
`;

(): {
  someLong: boolean,
  t: boolean
} =>
  `
    a
  `;

(
  someLong: boolean,
  t: boolean
) => `
    a
  `;

(
  someLong: boolean,
  t: boolean
) =>
  `
    a
  `;
