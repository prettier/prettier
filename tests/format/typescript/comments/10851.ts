const generate = (
  // @ts-expect-error requireOutside Babel transform
  requireOutside('@babel/generator') as typeof import('@babel/generator')
).default;

const currentTable = ( // eslint-disable-next-line no-await-in-loop
  await getCurrentTables(projectId)
).find((table) => table.id === id);
