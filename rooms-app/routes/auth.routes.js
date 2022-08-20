const router = require("express").Router();

const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { rawListeners } = require("../app");
const saltRounds = 12;

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/signup", async (req, res) => {
  const { email, userName, password } = req.body;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUserObj = {
    email,
    userName,
    password: passwordHash,
  };
  await UserModel.create(newUserObj);
  //   //remove the hashed password from the DB user
  //   newUserDB.password = "****";
  //   req.session.currentUser = newUserDB;
  res.redirect("/auth/login");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userInDB = await UserModel.findOne({ email });

  //if the user is found by the email then continue to check the password
  if (userInDB) {
    const dbHashPassword = userInDB.password;
    const doesPasswordMatch = await bcrypt.compare(password, dbHashPassword);

    //if the email is found and the password matches continue to profile page and add currentUser to session object

    if (doesPasswordMatch) {
      //remove the hashed password from the DB user
      userInDB.password = "****";
      req.session.currentUser = userInDB;
      res.redirect("/auth/profile");
    }
    //else redirect to login with error that password doesn't match
    else {
      res.render("login", { error: "Incorrect Password..." });
    }
  }
  //else redirect to login with error that email is not found in db
  else {
    res.render("login", { error: "Email not found" });
  }
});

router.get("/profile", (req, res) => {
  console.log("from profile", req.session);
  res.render("profile");
});

module.exports = router;
