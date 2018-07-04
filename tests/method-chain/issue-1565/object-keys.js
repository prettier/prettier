// https://github.com/prettier/prettier/issues/1565#issuecomment-313638802
Object.keys(props)
  .filter(key => key in own === false)
  .reduce((a, key) => {
    a[key] = props[key];

    return a;
  }, {});
Object.keys(props).filter(key => key in own === false).reduce((a, key) => {
  a[key] = props[key];

  return a;
}, {});
