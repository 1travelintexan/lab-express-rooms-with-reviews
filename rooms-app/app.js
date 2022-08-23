require("dotenv/config");
// ℹ️ Connects to the database
require("./db");
const express = require("express");
const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

app.set("trust proxy", 1); // trust first proxy
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI || "mongodb://127.0.0.1/rooms-app",
  collection: "sessions",
});

app.use(
  require("express-session")({
    secret: process.env.secret_sess,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hours
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);

//Passport set up
const UserModel = require("./models/User.model");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

app.use(passport.initialize());
app.use(passport.session());

// Passport serialize
passport.serializeUser((user, callback) => {
  callback(null, user._id);
});

// Passport deserialize
passport.deserializeUser((id, callback) => {
  UserModel.findById(id)
    .then((user) => callback(null, user))
    .catch((err) => callback(err));
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "username", // by default
      passwordField: "password", // by default
    },
    (username, password, done) => {
      UserModel.findOne({ username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Incorrect username" });
          }
          if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: "Incorrect password" });
          }
          done(null, user);
        })
        .catch((err) => done(err));
    }
  )
);

// default value for title local
const capitalized = require("./utils/capitalized");
const projectName = "rooms-app";

app.locals.appTitle = `${capitalized(projectName)} created with IronLauncher`;

// 👇 Start handling routes here
const index = require("./routes/index.routes");
app.use("/", index);

const auth = require("./routes/auth.routes");
app.use("/auth", auth);

//Passport routes
const passportRoutes = require("./routes/passport.routes");
app.use("/passport", passportRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
