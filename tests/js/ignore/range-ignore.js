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

// If else statements
// prettier-ignore-start
if(after == 10) {}
else if  ((after == 20)||after==1) {
  after  = 11;
} else {after =    12;}
// prettier-ignore-end

function isNodeIgnoreComment(comment){
  const match = comment.value.match(/\s*prettier-ignore(?:-(start|end))?\s*/);
  
  // Ternary statements, in a local scope
  // prettier-ignore-start
  const ignore = match === null ? false : match[1] && comment.leading ? match[1] : "next";
  // prettier-ignore-end

  return ignore;
}
this_shall_not_be_ignored   =  24;

// Template literals and function chaining
// prettier-ignore-start
const content = `
const env = ${ JSON.stringify({
  assetsRootUrl: env.assetsRootUrl,
	env: env.env,
	role: "client",
	adsfafa: "sdfsdff",
	asdfasff: "wefwefw",
  fefef: "sf sdfs fdsfdsf s dfsfds"
}, null, "\t") });
`;

function foo() {
  return a
  .b()
  .c()
  // Comment
  ?.d()
}
// prettier-ignore-end
