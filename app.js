const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const mongoose = require("mongoose");
const User = require("./models/user");

const app = express();

const attendanceRoutes = require("./routes/attendance");
const workHoursRoutes = require("./routes/workHour");
const covidRoutes = require("./routes/covid");
const profileRoutes = require("./routes/profile");

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
app.use("/covid", covidRoutes);
app.use("/profile", profileRoutes);

app.use("/", errorControllers.get404);

mongoose
  .connect(MONGODB_URI)
  // .then((result) => {
  //   const user = new User({
  //     full: "Mai Quốc Huy",
  //     email: "test@gmail.com",
  //doB: new Date(1992,07,14),
  //      salaryScale:1.1,
  // startDate:new Date(2020,07,14),
  //department: "IT",
  //imageUrl:'fsaf',
  //     isWork: false,
  //     currentWorkHour: null,
  //     annualLeave: 11,
  //    injectionCovid:[]
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
