breakAfterCast = <PermissionsChecker<any> | undefined>(<any>permissions)[receiverType];
breakAfterCast = <PermissionsChecker<any> | undefined>(<any>permissions)(#[receiverType]);

testObjLiteral =  <PermissionsChecker<any> | undefined>{ prop1: "myPropVal" };
testObjLiteral =  <PermissionsChecker<any> | undefined>#{ prop1: "myPropVal" };
