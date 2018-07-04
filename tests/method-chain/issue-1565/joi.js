// https://github.com/prettier/prettier/issues/1565#issuecomment-375594875
const { error } = Joi.validate(promotion, Joi.object().keys({
  companyId: Joi.number().integer().required(),
  newPlanId: Joi.number().integer().required(),
  oldPlanId: Joi.number().integer(),
  oldPlanPrice: Joi.number(),
  start: Joi.date().iso().required(),
  end: Joi.date().iso().min(Joi.ref('start')).required()
}));
const { error } = Joi.validate(
  promotion,
  Joi.object().keys({
    companyId: Joi.number()
    .integer()
    .required(),
    newPlanId: Joi.number()
    .integer()
    .required(),
    oldPlanId: Joi.number().integer(),
    oldPlanPrice: Joi.number(),
    start: Joi.date()
    .iso()
    .required(),
    end: Joi.date()
    .iso()
    .min(Joi.ref('start'))
    .required()
  })
);
