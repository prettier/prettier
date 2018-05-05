describe.each`
a|b|expected
${11   } | ${  1  }|${222}
${1-1}|${2+2}|${ 3333}
${2+1+2}|${1111}|${3}
`('$a + $b', ({a, b, expected}) => {
  test(`returns ${expected}`, () => {
    expect(a + b).toBe(expected);
  });

  test(`returned value not be greater than ${expected}`, () => {
    expect(a + b).not.toBeGreaterThan(expected);
  });

  test(`returned value not be less than ${expected}`, () => {
    expect(a + b).not.toBeLessThan(expected);
  });
});

describe.only.each`
a|b|expected
${11   } | ${  1  }|${222}|${'unknown column 1'}|${'unknown column 2'}
${1-1}|${2+2}|${ 3333}
${2+1+2}|${1111}|${3}          |${'unknown column xyz'}
`

describe.only.each`
||
${11   } | ${  1  }|${222}|${'unknown column 1'}|${'unknown column 2'}
${1-1}|${2+2}|${ 3333}
${2+1+2}|${1111}|${3}          |${'unknown column xyz'}
`