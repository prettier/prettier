const working = /* JS */ `
const bar = 'bar';
console.log(   bar    );
`;

const notWorking = /* JS */ `
const bar = ${JSON.stringify(working)};
console.log(   bar    );
`;

const template = /* JS */ `
  const myValue = \`1234\`;
  const interpolated = \`\${myValue}\`;
  const escaped = \`\\\${myValue}\`;
`;

const nested = /* JS */ `
  const nested = /* JS */ \`
    const nested = /* JS */ \\\`
      console.log('hello');
    \\\`;
  \`;
`;
