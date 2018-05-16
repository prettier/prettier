const Button = styled.a`
/* Comment */
	display: ${props=>props.display};
`;

styled.div`
	display: ${props=>props.display};
	border: ${props=>props.border}px;
	margin: 10px ${props=>props.border}px ;
`;

styled.span`
 ${props => props.right && css`
	padding: 10px 134px 10px 20px;
    &:after {
		left: initial;
      right: 30px      ;
    }
  `}
`

styled.span`
  ${props => props.standalone && props.justifyContent && props.alignItems && css`
    display: ${display};
    ${flexAlignment};
  `}
`

styled.div`
  top: ${ps =>
    (ps.count * -REGION_HEIGHT) / 100 + (100 - REGION_HEIGHT / 100)}%;
  bottom: 0;
`

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
