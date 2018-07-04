// https://github.com/prettier/prettier/issues/1565#issuecomment-339806934
something().then(() => doSomethingElse()).then(result => dontForgetThisAsWell(result))
something()
   .then(() => doSomethingElse())
   .then(result => dontForgetThisAsWell(result))

// https://github.com/prettier/prettier/issues/1565#issuecomment-372469267
fetchUser(id)
  .then(fetchAccountForUser)
  .catch(handleFetchError)
fetchUser(id).then(fetchAccountForUser).catch(handleFetchError)

// https://github.com/prettier/prettier/issues/1565#issuecomment-399123593
fetchApi().then(res => res.data).catch(err => err.stack);
fetchApi()
         .then(res => res.data)
         .catch(err => err.stack);
