var dns = require("dns");

/* lookup */

dns.lookup("test.com", (err, address, family) => {
  (err: ?Error);
  (address: string);
  (family: number);
});

dns.lookup("test.com", 6, (err, address, family) => {
  (err: ?Error);
  (address: string);
  (family: number);
});

dns.lookup("test.com", { family: 6 }, (err, address, family) => {
  (err: ?Error);
  (address: string);
  (family: number);
});

dns.lookup(); // error

dns.lookup("test.com"); // error

dns.lookup("test.com", 4); // error

dns.lookup("test.com", { family: 6 }); // error

dns.lookup("test.com", null, (err, address, family) => {}); // error

dns.lookup((err, address, family) => {}); // error
