const Button = styled.a`
/* Comment */
	display: ${props=>props.display};
`;

styled.div`
	display: ${props=>props.display};
	border: ${props=>props.border}px;
	margin: 10px ${props=>props.border}px ;
`;

const EqualDivider = styled.div`
margin: 0.5rem;
		padding: 1rem;
	background: papayawhip    ;

	> * {
	flex: 1;

	&:not(:first-child) {
			${props => props.vertical ? 'margin-top' : 'margin-left'}: 1rem;
		}
	}
`;

const header = css`
.top-bar {background:black;
margin: 0;
    position: fixed;
	top: 0;left:0;
	width: 100%;
    text-align: center     ;
	padding: 15px  0  0  1em;
		z-index: 9999;
}

.top-bar .logo {
  height: 30px;
  margin: auto; 
    position: absolute;
	left: 0;right: 0;
}
`;

// #6259 #4520
styled.div`
         ${expr}:not(:first-child) {
    // should not add space after :not
}
         ${expr}[checked] {
    // should not add space before [
}
  margin: 0;.input {}
`

// #5465 #5614
css`
         prop: var(--foo--${expr});
background-color: var(--${props => props.color});
`

// #5219
css`
         src: "${expr}";
`;

// #6392
styled(_A)`
         ${B}, ${C} {}
`

// #5961
styled.div`
         @media (min-width: 1px) {
${Step}:nth-child(odd) {
// should not add space after :nth-child
}
}
`;

// #4355
styled.div`
         border: 1px solid ${({active}) => active ? themeColor.active : themeColor.inactive};
`

// #2350
styled.div`
         display: block;
  ${props => props.rounded && 'border-radius: 5px;'}
`;

// #2883
css`
&.foo .${bar}::before,&.foo[value="hello"] .${bar}::before {
  position: absolute;
}
`;