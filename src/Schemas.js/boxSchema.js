// boxSchema.js
const mongoose = require("mongoose");

const BoxSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      name: String,
      emoji: String,
      quantity: Number,
    },
  ],
});

module.exports = mongoose.model("Box", BoxSchema);
