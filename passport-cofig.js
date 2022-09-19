const LocalStragery = require("passport-local").Strategy;

function initialize(passport) {
  const authenticateUser = (username, password, done) => {};
  passport.use(
    new LocalStragery({ usernameField: "username" }),
    authenticateUser
  );
  passport.serializeUser((user, done) => {});
  passport.deserializeUser((id, done) => {});
}
