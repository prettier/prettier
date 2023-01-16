await Promise.all(
  (await readdir("src")).map(async (path) => {
    import(`./${path}`);
  })
);
