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

Button.extend.attr({})`
border-color : black;
`

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

styled.div`
  ${bar}
  baz
`

styled.span`
  foo
  ${bar}
  baz
`

styled.div`
  foo
  ${bar}
  ${baz}
`

styled.span`
  ${foo}
  ${bar}
`

styled.div`
  ${foo} bar
`

styled.span`
  ${foo} ${bar}
  baz: ${foo}
`

styled.span`
${foo};
${bar};
`

styled.span`
${foo}: ${bar};
`

styled.span`
${foo}: ${bar}
`

styled.span`
${foo}:
${bar}
`

styled.span`
${foo}:
${bar};
`

styled.a`
  ${feedbackCountBlockCss}
  text-decoration: none;

  ${FeedbackCount} {
    margin: 0;
  }
`

const StyledComponent = styled.div`
  ${anInterpolation}
  /* a comment */

  .aRule {
    color: red
  }
`;

const StyledComponent = styled.div`
  ${anInterpolation}

  /* a comment */

  .aRule {
    color: red
  }
`;
