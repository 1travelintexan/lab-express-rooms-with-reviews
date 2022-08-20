const router = require("express").Router();
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth.middlewares");

const UserModel = require("../models/User.model");
const RoomModel = require("../models/Room.model");
const bcrypt = require("bcryptjs");
const saltRounds = 12;

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/login", isLoggedOut, (req, res) => {
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

router.get("/profile", isLoggedIn, async (req, res) => {
  const profileUser = req.session.currentUser;
  const currentRooms = await RoomModel.find().populate("owner");
  await currentRooms.map((elem) => {
    if (profileUser._id.toString() === elem.owner._id.toString()) {
      elem.isOwner = true;
    }
  });
  console.log("current rooms", currentRooms);
  res.render("profile", { profileUser, currentRooms });
});

//<=============Start creating rooms here==============>
router.get("/create-room", (req, res) => {
  const currentUser = req.session.currentUser;
  res.render("create-room", { currentUser });
});

router.post("/create-room", async (req, res) => {
  const newRoom = await RoomModel.create({ ...req.body, isOwner: false });
  res.redirect("/auth/profile");
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
