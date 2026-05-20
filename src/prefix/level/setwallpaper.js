const Wallpaper = require('../../Schemas.js/wallpaperSchema');

module.exports = {
  name: "setwallpaper",
  run: async (client, message, args) => {
    try {
      const requestedWallpaperName = args.join(" ");
      const userId = message.author.id;

      const existingWallpaper = await Wallpaper.findOne({
        userId,
        setWallpaper: true
      });

      if (existingWallpaper) {
        await Wallpaper.updateOne(
          { userId, wallpaperName: existingWallpaper.wallpaperName },
          { setWallpaper: false }
        );
      }

      const newWallpaper = await Wallpaper.findOneAndUpdate(
        { userId, wallpaperName: { $regex: new RegExp(`^${requestedWallpaperName}$`, 'i') } },
        { setWallpaper: true },
        { new: true }
      );

      if (!newWallpaper) {
        return message.reply(`Sorry, "${requestedWallpaperName}" is not available.`);
      }

      return message.reply(`"${requestedWallpaperName}" has been set as your wallpaper.`);
    } catch (err) {
      console.error('Error occurred while setting wallpaper:', err);
      return message.reply('There was an issue setting the wallpaper.');
    }
  },
};
