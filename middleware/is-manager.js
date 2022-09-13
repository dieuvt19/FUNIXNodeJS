module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn && req.session.user.roll !== "MANAGER") {
    return res.redirect("/login");
  }
  next();
};
