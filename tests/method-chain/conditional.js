(valid
  ? helper.responseBody(this.currentUser)
  : helper.response(401))
.map(res => res.json());

(valid
  ? helper.responseBody(this.currentUser)
  : helper.responseBody(defaultUser))
.map(res => res.json());
