exports.get404 = (req, res, next) => {
  res.render("error", { pageTitle: "Page not found!", path: "Error" });
};
