const envSpecific = {
  domain:
    do {
      if(env === 'production') 'https://abc.mno.com/';
      else if(env === 'development') 'http://localhost:4000';
    }
};

let x = do {
  let tmp = f();
  tmp * tmp + 1
};

let x = do {
  if (foo()) { f() }
  else if (bar()) { g() }
  else { h() }
};

function foo() {
  return (
    <nav>
      <Home />
      {
        do {
          if (loggedIn) {
            <LogoutButton />
          } else {
            <LoginButton />
          }
        }
      }
    </nav>
  );
}

(do {});
(do {} + 1);
(1 + do {});
() => do {};
