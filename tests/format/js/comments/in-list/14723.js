function doSomething(first, second) {
  	combineLatest([
            first.watchIt().pipe(
                  // tap(x => console.log(x))
                ),
            second.watchIt().pipe(
              tap((x) => console.log(x))
            ),
        ])
}
