const getIconEngagementTypeFrom = (engagementTypes: Array<EngagementType>) =>
  iconEngagementType => engagementTypes.includes(iconEngagementType);

const getIconEngagementTypeFrom2 =
  (
    engagementTypes: Array<EngagementType>,
    secondArg: Something
  ) =>
  iconEngagementType =>
  engagementTypes.includes(iconEngagementType);

const getIconEngagementTypeFrom2 =
  (
    engagementTypes: Array<EngagementType>,
    secondArg: Something,
    thirdArg: SomethingElse
  ) =>
  iconEngagementType =>
  engagementTypes.includes(iconEngagementType);
