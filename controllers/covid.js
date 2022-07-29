const Temp = require("../models/temp");
const User = require("../models/user");
const Covid = require("../models/covid");
const Utils = require("../utils/utils");

const Constants = require("../utils/constants");

//GET --> /covid
exports.getCovid = (req, res, next) => {
  //tìm kiếm thông tin covid và hiển thị
  const temps = Temp.find({ userId: req.user._id })
    .sort({ dateTemp: -1 })
    .then((temps) => {
      temps = temps.map((temp) => {
        temp._doc.dateTemp = Utils.DATE_UTILS.dateTimeToStringForWeb(
          temp.dateTemp
        );
        return temp;
      });
      res.render("covid", { pageTitle: "Covid", path: "/covid", temps: temps });
    })
    .catch((err) => console.log(err));
};
//POST --> /covid/temp
exports.postTemp = (req, res, next) => {
  //tìm kiếm thông tin nhiệt độ và hiển thị
  let dateTemp = new Date();
  if (req.body.date) {
    dateTemp = new Date(req.body.date);
  }
  const temp = new Temp({
    userId: req.user,
    temp: parseFloat(req.body.temp),
    dateTemp: dateTemp,
  });
  temp
    .save()
    .then((temp) => {
      res.redirect("/covid");
    })
    .catch((err) => console.log(err));
};

//GET --> /covid/injection
exports.getInjection = (req, res, next) => {
  //lấy thông tin mũi tiêm và hiển thị
  let injectionsCovid = [...req.user.injectionCovid];
  injectionsCovid = injectionsCovid.map((injection) => {
    injection._doc.dateInjection = Utils.DATE_UTILS.dateTimeToStringForWeb(
      injection.dateInjection
    );
    injection._doc.typeVacxin =
      Constants.TYPE_VACXIN[injection._doc.typeVacxin - 1];
    return injection;
  });

  res.render("covidInjection", {
    pageTitle: "Thông tin tiêm chủng",
    path: "/covid",
    injectionsCovid: injectionsCovid,
  });
};

//POST --> /covid/injection
exports.postInjection = (req, res, next) => {
  //tạo mới thông tin mũi tiêm và lưu vào mảng injectionCovid của user
  //sau đó lưu thông tin lên mongodb
  const injectionCovid = req.user.injectionCovid;
  const injection = {
    index: parseInt(req.body.index),
    typeVacxin: parseInt(req.body.type),
    dateInjection: new Date(req.body.date),
  };
  injectionCovid.push(injection);
  req.user
    .save()
    .then((result) => res.redirect("/covid/injection"))
    .catch((err) => console.log(err));
};

//GET --> /covid/info-covid
exports.getCovidInfo = (req, res, next) => {
  //tìm kiếm thông tin covid và hiển thị
  Covid.find({ userId: req.user._id })
    .sort({ dateCovid: -1 })
    .then((infoCovids) => {
      infoCovids = infoCovids.map((info) => {
        info._doc.dateCovid = Utils.DATE_UTILS.dateTimeToStringForWeb(
          info.dateCovid
        );
        return info;
      });
      res.render("covidInfo", {
        pageTitle: "Thong tin Covid",
        path: "/covid",
        infoCovids: infoCovids,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//POST --> /covid/info-covid
exports.postCovidInfo = (req, res, next) => {
  //nếu không có thông tin thì trả về trang /covid/info-covid
  if (!req.body.covid) {
    return res.redirect("/covid/info-covid");
  }
  //tạo thông tin covid và lưu vào mongodb
  const covidInfo = new Covid({
    userId: req.user,
    isCovid: req.body.covid === "1" ? true : false,
  });
  return covidInfo
    .save()
    .then((result) => {
      req.user.isCovid = result;
      req.user.save();
    })
    .then((result) => {
      res.redirect("/covid/info-covid");
    })
    .catch((err) => console.log(err));
};

//GET --> /covid/covid-staff
exports.getCovidStaff = (req, res, next) => {
  User.find({ department: req.user.department, isManager: false })
    .populate("isCovid")
    .then((users) => {
      users.map((user) => {
        user._doc.startDate = Utils.DATE_UTILS.stringDate1(user.startDate);
        if (user.isCovid) {
          if (user.isCovid.isCovid) {
            user._doc.isCovid = "Dương tính";
          } else {
            user._doc.isCovid = "Âm tính";
          }
        } else {
          user._doc.isCovid = "Chưa có thông tin";
        }
        user._doc.injectionCovid = user._doc.injectionCovid.length + " mũi";
      });
      res.render("covid-staff", {
        pageTitle: "Thông tin covid",
        path: "/manager",
        users: users,
      });
    })
    .catch((err) => console.log(err));
};
