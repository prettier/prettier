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

const RedBlock = styled.div`
  display: block;
  background-color: red;
  ${props => props.rounded && 'border-radius: 5px;'}
`;

const Button = styled.a`
  /* This renders the buttons above... Edit me! */
  display: inline-block;
  border-radius: 3px;
  padding: 0.5rem 0;
  margin: 0.5rem 1rem;
  width: 11rem;
  background: transparent;
  color: white;
  border: 2px solid white;

  /* The GitHub button is a primary button
   * edit this to target it specifically! */
  ${props => props.primary && css`
    background: white;
    color: palevioletred;
  `}
`

const Input = styled.input.attrs({
  // we can define static props
  type: 'password',

  // or we can define dynamic ones
  margin: props => props.size || '1em',
  padding: props => props.size || '1em'
})`
  color: palevioletred;
  font-size: 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;

  /* here we use the dynamically computed props */
  margin: ${props => props.margin};
  padding: ${props => props.padding};
`;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Rotate = styled.div`
  display: inline-block;
  animation  :  ${rotate360}  2s  linear  infinite  ;
  padding: 
  2rem 1rem;
  font-size: 1.2rem
`;

const StyledView = styled.View`
  background-color: papayawhip
`;

const StyledText = styled.Text`
  color: palevioletred
`;

const ButtonWrapper = styled.button`
  ${base}
  ${hover}
  ${opaque}
  ${block}
  ${active}
  ${disabled}
  ${outline}
  ${dashed}
  ${spacing}
`;
