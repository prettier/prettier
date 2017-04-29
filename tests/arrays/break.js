const promises = [
  Promise.resolve().then(console.log).catch(err => {
    console.log(err)
    return null
  }),
  redis.fetch(),
  other.fetch(),
]
