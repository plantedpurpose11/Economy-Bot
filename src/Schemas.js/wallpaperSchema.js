const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  wallpaperName: { type: String, required: true },
  wallpaperLink: { type: String, required: true },
  setWallpaper: { type: Boolean, default: false }, // New field to track if the wallpaper is set
});

module.exports = mongoose.model('Wallpaper', wallpaperSchema);
