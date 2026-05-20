const mongoose = require('mongoose');

// Create the channelsDisable schema
const channelsDisableSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
});

const ChannelsDisable = mongoose.model('ChannelsDisable', channelsDisableSchema);
module.exports = ChannelsDisable;
