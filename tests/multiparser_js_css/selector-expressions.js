export const foo = css`
&.foo .${bar}::before,&.foo[value="hello"] .${bar}::before {
	position: absolute;
}
`;

export const bar = css`
a.${bar}:focus,a.${bar}:hover {
  color: red;
}

a#${bar} {
  color: blue;
}
`;

const foobar = css`
div[href=${value}] {
  color: blue
}

div[href="${value}"] {
  color: blue
}

div[${href}="value"] {
  color: blue
}
`;

export const global = css`
button.${foo}.${bar} {
  color: #fff;
}
`;
