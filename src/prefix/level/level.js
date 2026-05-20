const Level = require("../../Schemas.js/levelSchema");
const User = require("../../Schemas.js/userAccountCreation"); // Assuming this is the user schema file
const canvafy = require('canvafy');
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const Wallpaper = require('../../Schemas.js/wallpaperSchema');
const config = require('../../../config.json')

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];

module.exports = {
  name: "level",
  description: "Check your level or mentioned user's level",
  aliases: ['lvl'],
  usage: "level [optional: @user]",
  async run(client, message, args) {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    // Command cooldown check
    if (timeout.includes(message.author.id)) {
      const reply = await message.reply({
        content: "You are on a cooldown. Please wait 7 seconds!",
        ephemeral: true,
      });

      // Delete the cooldown message after 2 seconds
      setTimeout(() => {
        reply.delete().catch(console.error);
      }, 2000);

      return;
    }

    // Apply cooldown
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 7000);

    let targetUser = message.author;

    // Check if a user is mentioned
    if (message.mentions.users.size > 0) {
      targetUser = message.mentions.users.first();
    }

    // Fetch user data
    const user = await Level.findOne({ userId: targetUser.id });

    if (!user) {
      return message.reply(`${targetUser.tag} doesn't have a level yet.`);
    }

    const userData = await User.findOne({ userId: targetUser.id });
    if (!userData) {
      return message.reply(`${targetUser.tag} doesn't have an account yet.`);
    }

    const avatarURL = targetUser.displayAvatarURL({ format: "jpg" });

    const xpNeededForNextLevel = 20 + (user.level - 1) * 20;

    let backgroundImageURL = config.images.levelBackground; // Default background image

    // Check if the user has set a wallpaper
    const userWallpaper = await Wallpaper.findOne({ userId: targetUser.id, setWallpaper: true });
    if (userWallpaper) {
      backgroundImageURL = userWallpaper.wallpaperLink;
    }

    const allUsers = await Level.find();
    allUsers.sort((a, b) => b.level - a.level); // Sort users based on level (descending order)
    const userRank = allUsers.findIndex(u => u.userId === targetUser.id) + 1; // Find the user's rank

    const rank = await new canvafy.Rank()
      .setAvatar(avatarURL)
      .setBackground("image", backgroundImageURL)
      .setUsername(userData.userName)
      .setBorder("#fff")
      .setLevel(user.level)
      .setRank(userRank)
      .setCurrentXp(user.xp)
      .setRequiredXp(xpNeededForNextLevel)
      .build();

    message.reply({
      files: [{
        attachment: rank,
        name: `rank-${message.member.id}.png`
      }]
    });
  },
};
