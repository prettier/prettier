// tag selector
css`
         foo${exp}bar {}
`;
css`
         ${exp}bar {}
`;
css`
         foo${exp} {}
`;

// id selector
css`
         #foo${exp}bar {}
`;
css`
         #${exp}bar {}
`;
css`
         #${exp}bar {}
`;

// class selector
css`
         .foo${exp}bar {}
`;
css`
         .${exp}bar {}
`;
css`
         .${exp}bar {}
`;

// attribute name
css`
         [foo${exp}bar] {}
`;
css`
         [${exp}bar] {}
`;
css`
         [foo${exp}] {}
`;

// attribute value
css`
         [a^=foo${exp}bar] {}
`;
css`
         [a^=${exp}bar] {}
`;
css`
         [a^=foo${exp}] {}
`;
