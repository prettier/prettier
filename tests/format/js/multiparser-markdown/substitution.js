md`*${expression}*`;

md`
  ${a}

  ~~~js
  md\`${b}\`;
  ~~~

  ${c}
`;

md`
  ${a}

  ~~~js
  md\`\${b}\`;
  ~~~

  ${c}
`;
