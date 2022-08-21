const router = require("express").Router();
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth.middlewares");

const UserModel = require("../models/User.model");
const RoomModel = require("../models/Room.model");
const ReviewModel = require("../models/Review.model");

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

  //get all the rooms to show on profile page
  const currentRooms = await RoomModel.find().populate("owner reviews");
  //change is owner to true for rooms that match the session user. to show buttons on hbs file
  await currentRooms.map((elem) => {
    if (profileUser._id.toString() === elem.owner._id.toString()) {
      elem.isOwner = true;
    }
  });
  for (let i = 0; i < currentRooms.length; i++) {
    let reviews = currentRooms[i].reviews;
    for (let j = 0; j < reviews.length; j++) {
      await reviews[j].populate("reviewOwner");
      // let foundReviewOwner = await UserModel.findById(reviews[i].reviewOwner);
      // reviews[i].__v = foundReviewOwner.userName;
    }

    console.log("heres the owner", reviews);
  }
  //console.log("profile", currentRooms[0].reviews);

  res.render("profile", { profileUser, currentRooms });
});

//<=============Start creating rooms here==============>
router.get("/create-room", (req, res) => {
  const currentUser = req.session.currentUser;
  res.render("create-room", { currentUser });
});

router.post("/create-room", async (req, res) => {
  await RoomModel.create({ ...req.body, isOwner: false });
  res.redirect("/auth/profile");
});

router.get("/edit/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const roomToEdit = await RoomModel.findById(roomId);
  res.render("room-edit", { roomToEdit });
});

router.post("/edit/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { name, description, imageUrl } = req.body;
  const { owner } = req.session;
  await RoomModel.findByIdAndUpdate(
    roomId,
    {
      name,
      description,
      imageUrl,
      owner,
      isOwner: false,
    },
    { new: true }
  );
  res.redirect("/auth/profile");
});

router.get("/delete/:roomId", async (req, res) => {
  const { roomId } = req.params;
  await RoomModel.findByIdAndDelete(roomId);
  res.redirect("/auth/profile");
});

//comments routes
router.post("/comment/:roomId", async (req, res) => {
  const { roomId } = req.params;
  let newReview = await ReviewModel.create(req.body);
  await RoomModel.findByIdAndUpdate(roomId, {
    $push: { reviews: [newReview._id] },
  });
  res.redirect("/auth/profile");
});

router.get("/logout", isLoggedIn, async (req, res) => {
  await req.session.destroy();
  res.redirect("/");
});

module.exports = router;
