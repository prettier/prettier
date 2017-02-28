const envSpecific = {
  domain:
    do {
      if(env === 'production') 'https://abc.mno.com/';
      else if(env === 'development') 'http://localhost:4000';
    }
};
