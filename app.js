const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const mongoose = require("mongoose");
const User = require("./models/user");

const app = express();

const attendanceRoutes = require("./routes/attendance");
const workHoursRoutes = require("./routes/workHour");

const errorControllers = require("./controllers/errors");
const { Z_HUFFMAN_ONLY } = require("zlib");

const MONGODB_URI =
  "mongodb+srv://huymq:huymq123456@cluster0-gm4fb.mongodb.net/funixAsm?retryWrites=true&w=majority";

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findOne({ email: "test@gmail.com" })
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(attendanceRoutes);
app.use("/work-hour", workHoursRoutes);

app.use("/", errorControllers.get404);

mongoose
  .connect(MONGODB_URI)
  // .then((result) => {
  //   const user = new User({
  //     name: "huy",
  //     email: "test@gmail.com",
  //     isWork: false,
  //     currentWorkHour: null,
  //     annualLeave: 11,
  //   });
  //   return user.save();
  // })
  .then((result) => {
    console.log("Database connect!");
    app.listen(3000, () => {
      console.log("server run!");
    });
  })
  .catch((err) => console.log(err));
