const { model, Schema } = require("mongoose");

const roomSchema = new Schema({
  name: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  isOwner: false,
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

const RoomModel = model("room", roomSchema);
module.exports = RoomModel;
