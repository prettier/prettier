for (const value of ( // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  column.getFacetedUniqueValues() as Map<TValue, number>
).keys()) {
}

for (const value of ( // comment
  collection as Map<string, number>
).keys()) {}

for (const key in ( // comment
  collection as Record<string, number>
).entries()) {}

for await (const value of ( // comment
  collection as Map<string, number>
).keys()) {}
