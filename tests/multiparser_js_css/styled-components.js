const Button = styled.button`
	  color:   palevioletred ;

	font-size : 1em   ;
`;

const TomatoButton = Button.extend`
	color  : tomato  ;

border-color : tomato
    ;

`;

styled(ExistingComponent)`
       color : papayawhip ; background-color: firebrick`;


styled.button.attr({})`
border : rebeccapurple`;
