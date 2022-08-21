const { model, Schema } = require("mongoose");

const reviewSchema = new Schema({
  reviewOwner: { type: Schema.Types.ObjectId, ref: "User" },
  comment: { type: String, maxlength: 200 },
});

const ReviewModel = model("Review", reviewSchema);
module.exports = ReviewModel;
