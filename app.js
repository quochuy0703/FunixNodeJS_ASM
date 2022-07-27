const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const mongoose = require("mongoose");

const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);

const User = require("./models/user");

const app = express();

const attendanceRoutes = require("./routes/attendance");
const workHoursRoutes = require("./routes/workHour");
const covidRoutes = require("./routes/covid");
const profileRoutes = require("./routes/profile");
const authRoutes = require("./routes/auth");

const errorControllers = require("./controllers/errors");

const MONGODB_URI =
  "mongodb+srv://huymq:huymq123456@cluster0-gm4fb.mongodb.net/funixAsm?retryWrites=true&w=majority";

const store = new mongoDBStore({ uri: MONGODB_URI, collection: "sessions" });

//set view engine
app.set("view engine", "ejs");
app.set("views", "views");

//xử lý body và tài nguyên static
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//tìm kiếm user
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

//sử dụng các router
app.use(attendanceRoutes);
app.use(authRoutes);
app.use("/work-hour", workHoursRoutes);
app.use("/covid", covidRoutes);
app.use("/profile", profileRoutes);

app.use("/", errorControllers.get404);

//thiết lập mongodb
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
