// https://github.com/prettier/prettier/issues/1565#issuecomment-343767549
db.branch(
  db.table('users').filter({ email }).count(),
  db.table('users').insert({ email }),
  db.table('users').filter({ email }),
)
db.branch(
  db
    .table('users')
    .filter({ email })
    .count(),
  db.table('users').insert({ email }),
  db.table('users').filter({ email }),
)
