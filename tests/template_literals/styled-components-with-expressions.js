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
