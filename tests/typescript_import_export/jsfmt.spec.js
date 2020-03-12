// TODO: remove disableBabelTS when Babel's TS plugin gets support for import/export `type` modifier
run_spec(__dirname, ["typescript"], { disableBabelTS: true });
