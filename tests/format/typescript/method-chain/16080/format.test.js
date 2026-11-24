// https://github.com/prettier/prettier/issues/16080
// Type arguments in a member chain should stay on one line while the call
// arguments break.

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "original report",
        code: `
export class Test {
  public test() {
    return this.http
      .get<SettlementStatus[]>(
        'url so very long that will break line on 120       (we use 120 so here also)',
        { params },
      )

      .pipe(map((statuses) => statuses.map((status) => ({ value: status }))));

    return this.http
      .get<SettlementStatus[]>(
        'url so very long that will break line on 120       (we use 120 so here also)',
        { params },
      )
      .pipe(map((statuses) => statuses.map((status) => ({ value: status }))));

    return this.http
      .get<SettlementStatus[]>(
        'url so very long that will break line on 120       (we use 120 so here also)',
        { params },
      );
  }
}
`,
      },
    ],
  },
  ["typescript"],
  { printWidth: 120, singleQuote: true },
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      {
        name: "call followed by another call",
        code: `
function f() {
  return anObject.aFunction<AnInterface[]>(
    \`qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\`,
    11111111111111111111,
  ).doSomething();
}
`,
      },
      {
        name: "nested type arguments",
        code: `
function f() {
  return axios
    .post<ApiWrapper<ApiPaginatedResults<Facility>>>(
      "/api/url",
      { terms: searchTerm },
      { cancelToken, params: paginationQueryParams },
    )
    .then((response) => response.data.data);
}
`,
      },
    ],
  },
  ["typescript"],
  { tabWidth: 4 },
);
