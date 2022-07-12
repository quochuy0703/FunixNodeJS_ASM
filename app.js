const express = require("express");

const app = express();

app.use("/", (req, res, next) => {
  res.send("<h1>Hello world!</h1>");
});

app.listen(3000, () => {
  console.log("server run!");
});
