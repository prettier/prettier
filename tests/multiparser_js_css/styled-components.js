const ListItem = styled.li``;

const ListItem = styled.li` `;

const Dropdown = styled.div`position: relative;`

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

styled(ExistingComponent).attr({})`
border : rebeccapurple`;

styled.div`
  color: ${props => props.theme.colors.paragraph};
  /* prettier-ignore */
  ${props => props.small ? 'font-size: 0.8em;' : ''};
`

styled.div`
  color: ${props => props.theme.colors.paragraph};
  /* prettier-ignore */
  ${props => props.small ? 'font-size: 0.8em;' : ''}
`

styled.div`
   /* prettier-ignore */
  color: ${props => props.theme.colors.paragraph};
  ${props => props.small ? 'font-size: 0.8em;' : ''};
`

styled.div`
  color: ${props => props.theme.colors.paragraph};
  /* prettier-ignore */
  ${props => props.small ? 'font-size: 0.8em;' : ''};
  /* prettier-ignore */
  ${props => props.red ? 'color: red;' : ''};
`

styled.div`
  /* prettier-ignore */
  color: ${props => props.theme.colors.paragraph};
  /* prettier-ignore */
  ${props => props.small ? 'font-size: 0.8em;' : ''};
  /* prettier-ignore */
  ${props => props.red ? 'color: red;' : ''};
  /* prettier-ignore */
`

styled.div`
 ${sanitize} ${fonts}
  html {
    margin: 0;
  }
`
