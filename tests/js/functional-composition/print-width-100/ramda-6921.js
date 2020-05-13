const capitalize = compose(
  converge(concat(), [
    compose(
      toUpper,
      head,
    ),
    tail,
  ]),
  toLower,
);

const actions = {
  toggleItem: item =>
    evolve({
      selectedItems: ifElse(
        has(item.id),
        dissoc(item.id),
        assoc(item.id, item)
      )
    })
};

const getMenus = pipe(
	pluck('menus'),
	flatten,
	uniqBy(prop('id')),
);
