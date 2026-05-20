const Gem = require("../../Schemas.js/gemsSchema");

module.exports = {
  name: "activategem",
  aliases: ['ag'],
  description: "Activate a gem",
  usage: "activategem <gem_name>",

  run: async (client, message, args) => {
    try {
      const gemName = args[0]?.toLowerCase();

      if (!gemName) {
        return message.reply("Please provide the name of the gem to activate.");
      }

      const userGems = await Gem.findOne({ userId: message.author.id });

      if (!userGems || !userGems.gems || userGems.gems.length === 0) {
        return message.reply("You don't have any gems.");
      }

      const gem = userGems.gems.find(g => g.gemType.toLowerCase() === gemName);

      if (!gem) {
        return message.reply("You don't have this gem.");
      }

      if (gem.count === 0) {
        return message.reply("You don't have any of this gem. Buy it first!");
      }

      if (gem.activated) {
        return message.reply(`The gem "${gemName}" ${gem.emoji} is already activated.`);
      }

      gem.activated = true;
      await userGems.save();

      const gemEmoji = gem.emoji || "❓"; // Default emoji if gem doesn't have an emoji

      message.reply(`Gem "${gemName}" ${gemEmoji} has been activated.`);
    } catch (error) {
      console.error(error);
      message.reply("There was an error while trying to activate the gem.");
    }
  },
};
