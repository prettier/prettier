// @flow

class Bar {}

type One<T = Bar> = {}

type Two<T1 = Bar, T2 = Bar> = {}

type Three<T1 = Bar, T2 = number, T3 = Bar> = {}

const one1: One<string> = {};
const one2: One<Bar> = {};

const two1: Two<string, Bar> = {};
const two2: Two<Bar, Bar> = {};
const two3: Two<Bar, string> = {};

const three1: Three<Bar, number, Bar> = {};
const three2: Three<Bar, string, Bar> = {};
const three3: Three<string, number, Bar> = {};
const three4: Three<Bar, number, string> = {};
const three5: Three<> = {};
// $FlowFixMe: too many type params
const three6: Three<Bar, number, Bar, Bar> = {};
const three7: Three<Bar, number> = {};
