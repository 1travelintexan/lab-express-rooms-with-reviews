const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: String,
    password: String,
    username: String,
  },
  {
    timestamps: true,
  }
);
const User = model("User", userSchema);

module.exports = User;
