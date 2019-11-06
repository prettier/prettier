// expression in tag selector(middle)
css`
         foo${exp}bar {}
`;
// expression in tag selector(beginning)
css`
         ${exp}bar {}
`;
// expression in tag selector(end)
css`
         foo${exp} {}
`;

// expression in id selector(middle)
css`
         #foo${exp}bar {}
`;
// expression in id selector(beginning)
css`
         #${exp}bar {}
`;
// expression in id selector(end)
css`
         #${exp}bar {}
`;

// expression in class selector(middle)
css`
         .foo${exp}bar {}
`;
// expression in class selector(beginning)
css`
         .${exp}bar {}
`;
// expression in class selector(end)
css`
         .${exp}bar {}
`;

// expression in attribute name(middle)
css`
         [foo${exp}bar] {}
`;
// expression in attribute name(beginning)
css`
         [${exp}bar] {}
`;
// expression in attribute name(end)
css`
         [foo${exp}] {}
`;

// expression in attribute value(middle)
css`
         [a^=foo${exp}bar] {}
`;
// expression in attribute value(beginning)
css`
         [a^=${exp}bar] {}
`;
// expression in attribute value(end)
css`
         [a^=foo${exp}] {}
`;