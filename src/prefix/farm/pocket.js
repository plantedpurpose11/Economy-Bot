const { MessageEmbed, EmbedBuilder } = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation");
const Pocket = require("../../Schemas.js/PocketSchema");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const Gems = require("../../Schemas.js/gemsSchema");
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}
function toSuperscript(number) {
  const superscripts = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
  return number
    .toString()
    .split("")
    .map((digit) => superscripts[digit])
    .join("");
}

var timeout = [];
module.exports = {
  name: "pocket",
  aliases: ["p"],
  description: "Displays items in the user's pocket",
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
      const userAccount = await User.findOne({ userId: message.author.id });

      if (!userAccount) {
        return message.reply(
          ":ribbon: **First use** `ep start` **to start your journey.**"
        );
      }

      const userPocket = await Pocket.findOne({ userId: message.author.id });

      if (!userPocket || !userPocket.items.length) {
        return message.reply("You have no items in your pocket.");
      }

     

      const pocketEmbed = new EmbedBuilder()
        .setColor("#008000")
        .setTitle(`**__${message.author.username}'s__** Pocket`)

      const pocketItems = userPocket.items.map((item) => ({
        name: `${item.emoji} **x${item.quantity}**`,
        value: `\u200B`, // Add an empty field value
      }));

      pocketEmbed.addFields(pocketItems);

      // Fetch the gems for the user
      const userGems = await Gems.findOne({ userId: message.author.id });

      if (userGems && userGems.gems.length > 0) {
        const gemsList = userGems.gems
          .map(
            (gem) => `${gem.emoji}${toSuperscript(gem.count)} **${gem.gemType}**`
          )
          .join("\n");
        pocketEmbed.addFields({
          name: "\u200B",
          value: "**Gems**:\n" + gemsList,
        });
      }

      message.reply({ embeds: [pocketEmbed] });
    } catch (err) {
      console.error("Error fetching pocket:", err);
      message.reply("There was an error fetching your pocket.");
    }
  },
};
