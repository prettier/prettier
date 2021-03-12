const result$ = stream1$.pipe(
  withLatestFrom(stream2$),
  distinctUntilChanged(),
  debounceTime(50)
)

const searchEpic = action$ =>
    action$.pipe(
        filter(isActionOf(Actions.search.request)),
        debounceTime(500),
        switchMap(action =>
            from(
                doSearch(
                    action.payload.firstName,
                    action.payload.middleName,
                    action.payload.lastName,
                    action.payload.date,
                ),
            ).pipe(
                map(Actions.search.success),
                catchApiError(Actions.search.failure()),
            ),
        ),
    );
