// expression in at-rule(middle)
css`
         @foo${exp}bar (min-width: 100px) {div {}}
`;
// expression in at-rule(beginning)
css`
         @${exp}bar (min-width: 100px) {div {}}
`;
// expression in at-rule(end)
css`
         @foo${exp} (min-width: 100px) {div {}}
`;

// expression in at-rule prop(middle)
css`
         @media (foo${exp}bar: 100px) {div {}}
`;
// expression in at-rule prop(beginning)
css`
         @media (${exp}bar: 100px) {div {}}
`;
// expression in at-rule prop(end)
css`
         @media (foo${exp}: 100px) {div {}}
`;

// expression in at-rule value(middle)
css`
         @media (min-width: foo${exp}bar) {div {}}
`;
// expression in at-rule value(beginning)
css`
         @media (min-width: ${exp}bar) {div {}}
`;
// expression in at-rule value(end)
css`
         @media (min-width: foo${exp}) {div {}}
`;

// expression in at-rule condition(middle)
css`
         @media (foo${exp}bar) {div {}}
`;
// expression in at-rule condition(beginning)
css`
         @media (${exp}bar) {div {}}
`;
// expression in at-rule condition(end)
css`
         @media (foo${exp}) {div {}}
`;