const bcryptjs = require("bcryptjs");

bcryptjs
  .hash("123456", 12)
  .then((hashedPassword) => console.log(hashedPassword));
