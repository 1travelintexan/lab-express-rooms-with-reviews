const router = require("express").Router();
const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { route } = require("./index.routes");

//signup with passport routes
router.get("/signup", (req, res) => {
  res.render("passport/signup");
});
router.post("/signup", (req, res, next) => {
  const { username, password } = req.body;

  // Check for empty fields
  if (!username || !password) {
    res.render("passport/signup", { errorMessage: "Fields cannot be empty!" });
    return;
  }

  UserModel.findOne({ username })
    .then((foundUser) => {
      //Check if user exists
      if (foundUser !== null) {
        res.render("passport/signup", {
          errorMessage: "This username already exists!",
        });
        return;
      }

      // If its a new user we need to:
      // Step 1: Hash the incoming password
      // Step 2: Create the new user

      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const newUser = new UserModel({
            username,
            password: hashedPassword,
          });

          newUser
            .save()
            .then(() => res.redirect("/passport/login"))
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

//login with passport routes
router.get("/login", (req, res) => {
  res.render("passport/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/passport/private-page",
    failureRedirect: "/passport/login",
  })
);

router.get("/private-page", (req, res) => {
  if (!req.user) {
    res.redirect("/passport/login"); // not logged-in redirect to login
    return;
  }
  //req.user is defined then render the profile page and send the user object
  res.redirect("/passport/profile");
});

router.get("/profile", (req, res) => {
  console.log("passport profile", req);
  let passportUser = req.user;
  res.render("passport/profile", { passportUser });
});
module.exports = router;
