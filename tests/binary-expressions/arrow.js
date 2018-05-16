function f() {
  const appEntitys = getAppEntitys(loadObject).filter(
    entity => entity && entity.isInstallAvailable() && !entity.isQueue() && entity.isDisabled()
  )
}

function f() {
  const appEntitys = getAppEntitys(loadObject).map(
    entity => entity && entity.isInstallAvailable() && !entity.isQueue() && entity.isDisabled() && {
      id: entity.id
    }
  )
}

function f() {
  const longEnoughToBreakComparison = () =>
    this.props.completion >= item.progressPercent &&
    this.props.redirectTo('/adventure')
}
