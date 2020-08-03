// Invalid, https://github.com/babel/babel/pull/11652/

#{
  a() {},
  async b() {},
  get c() {},
  set d(_) {},
  *e() {}
}
