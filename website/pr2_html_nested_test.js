test('nested HTML formatting', () => {
  const input = '<div><span><b>Hello</b></span></div>';
  const output = prettier.format(input, { parser: 'html' });
  expect(output).toContain('<div>');
});
