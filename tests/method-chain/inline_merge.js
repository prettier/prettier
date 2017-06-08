Object.keys(
  availableLocales({
    test: true
  })
)
.forEach(locale => {
  // ...
});

DraftSelectors.fragmentsNotPublishing[level]()
  .map(fragment => getRequiredSelectionInfoForFragment(fragment))
  .toSet();

Immutable.Seq.Keyed(
  segments.map(segment => [segment.id, segment])
).toOrderedMap();
