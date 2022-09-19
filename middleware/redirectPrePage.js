function redirectPrePage(url) {
  return (req, res, next) => {
    if (!req.session.isLoggedIn) {
      req.session.redirectTo = url;
      res.redirect("/login");
    }
    next();
  };
}
module.exports = {
  redirectPrePage,
};
