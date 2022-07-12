const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

const attendanceRoutes = require("./routes/attendance");

const errorControllers = require("./controllers/errors");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/attendance", attendanceRoutes);

app.use("/", errorControllers.get404);

app.listen(3000, () => {
  console.log("server run!");
});
