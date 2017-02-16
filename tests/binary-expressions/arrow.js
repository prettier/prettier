function f() {
  const appEntitys = getAppEntitys(loadObject).filter(
    entity => entity && entity.isInstallAvailable() && !entity.isQueue() && entity.isDisabled()
  )
}
