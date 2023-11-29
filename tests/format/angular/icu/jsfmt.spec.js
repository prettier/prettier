// The ICU component can be moved to the angular/angular tests when ICU parsing
// with control flow syntax has been fixed, but until then this component will
// not work with {angularControlFlowSyntax: true} (the default).
run_spec(import.meta, ["angular"], { angularControlFlowSyntax: false });
