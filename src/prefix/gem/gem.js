const { MessageEmbed, EmbedBuilder } = require("discord.js");
const emojis = require("../../../emojis.json");

const gemsArray = [
  {
    name: "BeastCharm",
    emoji: emojis.beastCharm,
    price: 120000,
    description:
      "If you have activated this gem, you will get 12 animals every time you search for animals.",
  },
  {
    name: "BountyBoost",
    emoji: emojis.bountyBoost,
    price: 150000,
    description:
      "If this gem is active then you can search more animals in 10 EP Coins.",
  },
  {
    name: "RapidBloom",
    emoji: emojis.rapidBloom,
    price: 230000,
    description:
      "If this gem is active then the growth time of your plant will be less.",
  },
  {
    name: "ChanceCharm",
    emoji: emojis.chanceCharm,
    price: 175000,
    description:
      "If this gem is active then when you coinflip your win chances will increase by 10%.",
  },
  {
    name: "PredatorsEdge",
    emoji: emojis.predatorsEdge,
    price: 35000,
    description:
      "If this gem is active then you will get good levels and attack animals.",
  },
  {
    name: "HarvestAmplifier",
    emoji: emojis.harvestAmplifier,
    price: 360000,
    description:
      "If this gem is active, you will get more sell price when you sell your boxes.",
  },
  
  // Add more gems here
];

module.exports = {
  name: "gem",
  run: async (client, message, args) => {
    try {
      const user = message.author;
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 256 });

      const marketEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Gem Market")
        .setDescription("Available Gems:")
        .setThumbnail(avatarURL)
        .setTimestamp();

      for (const gem of gemsArray) {
        marketEmbed.addFields({
          name: `${gem.name} | ${gem.emoji} x10`,
          value: `Price: **${gem.price.toLocaleString()} ${emojis.currencyEmoji}**\n${gem.description}`,
        });
      }

      message.channel.send({ embeds: [marketEmbed] });
    } catch (err) {
      console.error("Error:", err);
      return message.reply("An error occurred while fetching the market.");
    }
  },
};
