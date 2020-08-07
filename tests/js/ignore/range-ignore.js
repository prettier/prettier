// prettier-ignore-start
let i_like         = 1;
let my_assignments = 2;
let sorted         = 3;
// prettier-ignore-end
let but_not    = 4;
let after      = 5;
let ignore_end = 6;

/* prettier-ignore-start */
route('my-designs', '/my-designs/', require('./pages/my-designs/my-designs'));
route('order', '/:project/:thank/order/', require('./pages/order/order'));
route('order-success', '/:project/order-success/', require('./pages/order-success/order-success'));
route('page-not-found', '/page-not-found/', require('./pages/page-not-found/page-not-found'));
route('password-forgot', '/password-forgot/', require('./pages/password-forgot/password-forgot'));
route('restore-password', '/restore-password/:token', require('./pages/restore-password/restore-password'));
/* prettier-ignore-end */

let  this_shall_not_be_ignored   =  21;

// prettier-ignore-start
appApplication.post(
  `${APIRouteDefinitions.pathForRoute( APIDefinitions.routes.getPendingChangesForThreshold)}`,
  (req, res) => {
    validateRequest(req, res, APIDefinitions.routes.getPendingChangesForThreshold, req.body);
  }
);
appApplication.post(
  `${APIRouteDefinitions.pathForRoute( APIDefinitions.routes.getPendingChangesForThreshold)}`,
  (req, res) => {
    validateRequest(req, res, APIDefinitions.routes.getPendingChangesForThreshold, req.body);
  }
);
// prettier-ignore-end

function foo({
  a   =   0,
  // prettier-ignore-start
  b          = 1,
  // prettier-ignore-end
    c = 1
               }) {
                 console.log(a)
                 console.log(b)
  }

  this_shall_not_be_ignored   =  22;
