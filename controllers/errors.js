exports.get404 = (req, res, next) => {
  res.render("404", { pageTitle: "Page not found!", path: "Error" });
};
