const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: String,
  CoupleName: String,
  RestaurantChoices: [String],
  FoodChoices: [String],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
