// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/rooms-app";
// ℹ️ Connects to the database
require("./db");

//Makes sessions available to this file
const MongoStore = require("connect-mongo");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// app.set("trust proxy", 1); // trust first proxy
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
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
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

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
