export default function theFunction(action$, store) {
  return action$.ofType(THE_ACTION).switchMap(action => Observable
    .webSocket({
      url: THE_URL,
      more: stuff(),
      evenMore: stuff({
        value1: true,
        value2: false,
        value3: false
      })
    })
    .filter(data => theFilter(data))
    .map(({ theType, ...data }) => theMap(theType, data))
    .retryWhen(errors => errors));
}
