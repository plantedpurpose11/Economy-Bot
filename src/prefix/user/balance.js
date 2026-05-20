const User = require("../../Schemas.js/userAccountCreation"); // Assuming your schema is in a 'models' folder
const emojis = require("../../../emojis.json");

var timeout = [];

const Blacklist = require("../../Schemas.js/BlacklistSchema");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: "balance",
  aliases: ["bal", "money", "wallet", "coins", "coin"],
  description: "Check your account balance",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    //command cooldown top
    if (timeout.includes(message.author.id))
      return await message.reply({
        content: "You are on a cooldown. wait 5 seconds!",
        ephemeral: true,
      });

    try {
      // Check if the user exists
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply(
          `${emojis.level} **First use** \`ep start\` **to start your journey.**`
        );
      }

      //command cooldown
      timeout.push(message.author.id);
      setTimeout(() => {
        timeout.shift();
      }, 5000);

      message.reply(
        `Your current balance is **__${user.balance.toLocaleString()}__** ${emojis.currencyEmoji} EP coins`
      );
    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while fetching your balance.");
    }
  },
};
