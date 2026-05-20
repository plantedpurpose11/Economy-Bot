const { MessageEmbed, Permissions, EmbedBuilder } = require("discord.js");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const config = require('../../../config.json');

module.exports = {
  name: "blacklistusers",
  description: "Display blacklisted users",
  run: async (client, message, args) => {
    try {
      const botAdmins = config.adminIds;
      if (!botAdmins.includes(message.author.id)) {
        return message.reply("Only bot administrators can use this command.");
      }

      const blacklistedUsers = await Blacklist.find({});

      if (blacklistedUsers.length === 0) {
        return message.reply("There are no blacklisted users.");
      }

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Blacklisted Users")
        .setDescription("List of blacklisted users:");

      blacklistedUsers.forEach((user) => {
        embed.addFields({ name: 'User ID:', value: `${user.userId}` });
      });

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching blacklisted users:", error);
      message.reply("There was an error fetching blacklisted users.");
    }
  },
};
