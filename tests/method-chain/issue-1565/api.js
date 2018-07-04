// https://github.com/prettier/prettier/issues/1565#issuecomment-353593286
const API = (notificationService: NotificationService) => ({
  get: (ctx: any) => notificationService.get(ctx.params.id).then(ctx.ok),
  getByUserAndKey: (ctx: any) => notifciationService.getByUserAndKey({ ...ctx.params }).then(ctx.ok),
  find: (ctx: any) => notificationService.find(ctx.query).then(ctx.ok),
  create: (ctx: any) => notificationService.create(ctx.request.body).then(ctx.created),
  setStatus: (ctx: any) => notificationService.setStatus({
    id: ctx.params.id,
    status: ctx.request.body.status
  }).then(ctx.ok),
  setStatusBulk: (ctx: any) => notificationService.setStatusForMultiple(ctx.request.body).then(ctx.ok),
  cancel: (ctx: any) => notificationService.cancel({ key: ctx.params.key, userId: ctx.params.userId }).then(ctx.noContent)
})
const API2 = (notificationService: NotificationService) => ({
  get: (ctx: any) =>
    notificationService
      .get(ctx.params.id)
      .then(ctx.ok),
  getByUserAndKey: (ctx: any) =>
    notifciationService
      .getByUserAndKey({ ...ctx.params })
      .then(ctx.ok),
  find: (ctx: any) =>
    notificationService
      .find(ctx.query)
      .then(ctx.ok),
  create: (ctx: any) =>
    notificationService
      .create(ctx.request.body)
      .then(ctx.created),
  setStatus: (ctx: any) =>
    notificationService
      .setStatus({
        id: ctx.params.id,
        status: ctx.request.body.status
      })
      .then(ctx.ok),
  setStatusBulk: (ctx: any) =>
    notificationService
      .setStatusForMultiple(ctx.request.body)
      .then(ctx.ok),
  cancel: (ctx: any) =>
    notificationService
      .cancel({ key: ctx.params.key, userId: ctx.params.userId })
      .then(ctx.noContent)
})
