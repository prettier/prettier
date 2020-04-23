const Something = styled.div`
  background: var(--${one}); /* ... */
  border: 1px solid var(--${two}); /* ... */
`;

const StyledPurchaseCard = styled(Card)`
  min-width: 200px;
  background-color: var(--${props => props.color});
  color: #fff;
`;
