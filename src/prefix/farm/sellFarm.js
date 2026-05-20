const User = require("../../Schemas.js/userAccountCreation");
const Farm = require("../../Schemas.js/farmSchema");
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const emojis = require("../../../emojis.json");



async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}


var timeout = [];
module.exports = {
  name: "sellfarm",
  aliases: ['sf'],
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    // Command cooldown check
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
    try {
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply("You don't have an account yet!");
      }

      const userFarm = await Farm.findOne({ userId: message.author.id });
      if (!userFarm) {
        return message.reply("You don't own any farm to sell.");
      }

      let sellPrice = 0;
      if (userFarm.farmType === "Small Farm") {
        sellPrice = 6500;
      } else if (userFarm.farmType === "Medium Farm") {
        sellPrice = 15000;
      } else if (userFarm.farmType === "Large Farm") {
        sellPrice = 50000;
      }

      user.balance += sellPrice;
      await user.save();
      await userFarm.remove();

      return message.reply(`You sold your ${userFarm.farmType} for **${sellPrice}** ${emojis.currencyEmoji} Ep coins.`);
    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while selling the farm.");
    }
  },
};
