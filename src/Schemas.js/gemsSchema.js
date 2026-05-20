const mongoose = require('mongoose')

const GemsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  gems: [
    {
      gemType: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        required: true,
        default: 0,
      },
      emoji: {
        type: String,
        required: true,
        // Add any validation if needed for emoji format
      },
      activated: {
        type: Boolean,
        default: false, // Default value for activation status
      },
    },
    // Add more gem types here in the same format if needed
  ],
});

module.exports = mongoose.model('gemsSchema', GemsSchema);
