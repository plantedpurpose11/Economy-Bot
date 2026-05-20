// This assumes you have a 'cooldowns' collection in your MongoDB database
const mongoose = require("mongoose");
const Cooldown = require("../../Schemas.js/CooldownDaily"); // Assuming you have a Cooldown schema
const User = require("../../Schemas.js/userAccountCreation"); // Assuming you have a Cooldown schema
const emojis = require("../../../emojis.json");
const Blacklist = require('../../Schemas.js/BlacklistSchema');

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];

module.exports = {
  name: "daily",
  description: "Claim daily EP coins",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    //command cooldown top
    if (timeout.includes(message.author.id))
      return await message.reply({
        content: "You are on a cooldown. wait 10 seconds!",
        ephemeral: true,
      });

    //command cooldown
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);

    try {
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply(`${emojis.level} **First use** \`ep start\` **to start your journey.**`);
      }

      // Get the user's cooldown expiration time from the database
      let cooldown = await Cooldown.findOne({ userId: message.author.id });

      if (cooldown && cooldown.cooldownExpiration > Date.now()) {
        const remainingTime = cooldown.cooldownExpiration - Date.now();

        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);

        const timeLeftFormatted = `**${hours}** hours, **${minutes}** minutes`;

        return message.reply(
          `You have already claimed your daily coins! \nPlease wait ${timeLeftFormatted}.`
        );
      }

      // Add the balance and update cooldown
      user.balance += 658;
     // user.balance += 10000;
      await user.save();

      const newCooldown = {
        userId: message.author.id,
        cooldownExpiration: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      // Update or create cooldown in the database
      cooldown = await Cooldown.findOneAndUpdate(
        { userId: message.author.id },
        newCooldown,
        { upsert: true, new: true }
      );

      message.reply(
        `You have claimed your daily **__658__** ${emojis.currencyEmoji} EP coins!`
      );
    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while processing your request.");
    }
  },
};
