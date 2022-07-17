const Temp = require("../models/temp");
const Covid = require("../models/covid");

const Constants = require("../utils/constants");

exports.getCovid = (req, res, next) => {
  const temps = Temp.find({ userId: req.user._id })
    .then((temps) => {
      console.log(temps);
      res.render("covid", { pageTitle: "Covid", temps: temps });
    })
    .catch((err) => console.log(err));
};

exports.postTemp = (req, res, next) => {
  console.log(req.body);
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

exports.getInjection = (req, res, next) => {
  let injectionsCovid = [...req.user.injectionCovid];
  injectionsCovid = injectionsCovid.map((injection) => ({
    ...injection._doc,
    typeVacxin: Constants.TYPE_VACXIN[injection.typeVacxin - 1],
  }));

  res.render("covidInjection", {
    pageTitle: "Thông tin tiêm chủng",
    injectionsCovid: injectionsCovid,
  });
};

exports.postInjection = (req, res, next) => {
  console.log(req.body);
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

exports.getCovidInfo = (req, res, next) => {
  Covid.find({ userId: req.user._id })
    .then((infoCovids) => {
      res.render("covidInfo", {
        pageTitle: "Thong tin Covid",
        infoCovids: infoCovids,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCovidInfo = (req, res, next) => {
  console.log(req.body);
  if (!req.body.covid) {
    return res.redirect("/covid/info-covid");
  }
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
