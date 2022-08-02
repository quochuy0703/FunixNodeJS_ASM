const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const mongoose = require("mongoose");

const multer = require("multer");

const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);

const User = require("./models/user");

const attendanceRoutes = require("./routes/attendance");
const workHoursRoutes = require("./routes/workHour");
const covidRoutes = require("./routes/covid");
const profileRoutes = require("./routes/profile");
const authRoutes = require("./routes/auth");
const manageRoutes = require("./routes/manage");

const errorControllers = require("./controllers/errors");

const MONGODB_URI =
  "mongodb+srv://huymq:huymq123456@cluster0-gm4fb.mongodb.net/funixAsm?retryWrites=true&w=majority";

const app = express();

const store = new mongoDBStore({ uri: MONGODB_URI, collection: "sessions" });

// Catch errors
store.on("error", function (error) {
  console.log(error);
});

//set view engine
app.set("view engine", "ejs");
app.set("views", "views");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//xử lý body và tài nguyên static
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/")));

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

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  if (req.hasOwnProperty("user")) {
    res.locals.isManager = req.session.user.isManager;
  } else {
    res.locals.isManager = false;
  }

  next();
});

//sử dụng các router
app.use(attendanceRoutes);
app.use(authRoutes);
app.use("/work-hour", workHoursRoutes);
app.use("/covid", covidRoutes);
app.use("/profile", profileRoutes);
app.use("/manage", manageRoutes);

app.use("/", errorControllers.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

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
    app.listen(process.env.PORT || 8080, () => {
      console.log("server run!");
    });
  })
  .catch((err) => console.log(err));
