`${1 ?? 2}`;

`glp-text-${isImagePresent ? 56 : 64}@M`

const headerResolve = css.resolve`
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

styled.input`
	border: 1px solid
		${(props) => (props.isError?props.theme.colors.error:props.theme.colors.borderColor)};
	:focus {
		outline: ${(props) =>
				props.isError
        ?props.theme.colors.error
        :props.theme.colors.outline}
	}
`;

const value = `
  Hello ${(props) => (props.isError?props.theme.colors.error:props.theme.colors.borderColor)};
`;

return (<div css={`
  color: blue;
  font-size: 17 px;

  &:hover {
    color: green;
  }

  & .some-class {
    font-size: 20px;
  }
`}/>)
