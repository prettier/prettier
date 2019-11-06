// name
css`
         @foo${exp}bar (min-width: 100px) {div {}}
`;
css`
         @${exp}bar (min-width: 100px) {div {}}
`;
css`
         @foo${exp} (min-width: 100px) {div {}}
`;

// prop
css`
         @media (foo${exp}bar: 100px) {div {}}
`;
css`
         @media (${exp}bar: 100px) {div {}}
`;
css`
         @media (foo${exp}: 100px) {div {}}
`;

// value
css`
         @media (min-width: foo${exp}bar) {div {}}
`;
css`
         @media (min-width: ${exp}bar) {div {}}
`;
css`
         @media (min-width: foo${exp}) {div {}}
`;

// condition
css`
         @media (foo${exp}bar) {div {}}
`;
css`
         @media (${exp}bar) {div {}}
`;
css`
         @media (foo${exp}) {div {}}
`;