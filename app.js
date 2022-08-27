const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const moment = require("moment");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.locals.moment = require("moment");
const staffRoutes = require("./routes/staff");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("630089076575b9df797c0f6a")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use(staffRoutes);

app.use(errorController.get404);

mongoose
  .connect("mongodb+srv://dieu:dieu@asm1njs.bc5db.mongodb.net/staff")
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Võ Thùy Diệu",
          doB: "1995-03-19",
          salaryScale: 1,
          startDate: "2022-08-10",
          department: "IT",
          annualLeave: 2,
          image:
            "https://static2.yan.vn/YanNews/202109/202109270130486918-a5b18b8a-e9b6-4098-854b-e9b5728fa5db.jpeg",
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => console.log(err));
