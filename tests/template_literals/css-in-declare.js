// expression in declare prop(middle)
css`
         a {foo${exp}bar: 1;}
`;
// expression in declare prop(beginning)
css`
         a {${exp}bar: 1;}
`;
// expression in declare prop(end)
css`
         a {foo${exp}: 1;}
`;

// expression in declare value(middle)
css`
         a {a: foo${exp}bar;}
`;
// expression in declare value(beginning)
css`
         a {a: ${exp}bar;}
`;
// expression in declare value(end)
css`
         a {a: foo${exp};}
`;
