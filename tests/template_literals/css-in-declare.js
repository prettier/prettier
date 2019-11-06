// prop
css`
         a {foo${exp}bar: 1;}
`;
css`
         a {${exp}bar: 1;}
`;
css`
         a {foo${exp}: 1;}
`;

// value
css`
         a {a: foo${exp}bar;}
`;
css`
         a {a: ${exp}bar;}
`;
css`
         a {a: foo${exp};}
`;

// should insert semi
css`
         a {a: foo${exp}}
`;
// should remove extra semi
css`
         a {a: foo${exp};;}
         a {a: foo${exp};
;}
`;
