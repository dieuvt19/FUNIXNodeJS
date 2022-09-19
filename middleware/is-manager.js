// module.exports = (req, res, next) => {
//   if (req.session.user.role !== "MANAGER") {
//     res.status(401);
//     return res.send("Not allowed");
//   }
//   next();
// };

function authRole(role) {
  return (req, res, next) => {
    if (req.session.user.role !== role) {
      res.status(401);
      res.send("Not allowed");
    }
    next();
  };
}

module.exports = {
  authRole,
};
