const a = compose(
  b(),
  c,
)(d);

const b = compose(c, d)(e);
const c = compose(
  d(),
  e("thing1", "thing2")(),
)(f);

const d = compose(
  d(),
  e("thing1", "thing2")(),
);

const mapStateToProps = state => ({
  users: R.compose(
    R.filter(R.propEq('status', 'active')),
    R.values
  )(state.users)
});
