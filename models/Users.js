const mongoose = require("mongoose");

const User = mongoose.model("User", {
  account: {
    name: String,
    username: String,
    description: String,
  },

  comics: [
    {
      String,
    },
  ],
  characters: [
    {
      String,
    },
  ],
  email: { type: String, required: true, unique: true },
  salt: String,
  hash: String,
  token: String,
});

module.exports = User;
