const { EmbedBuilder } = require("discord.js");
const Wallpaper = require('../../Schemas.js/wallpaperSchema');
const User = require('../../Schemas.js/userAccountCreation');
const wallpapersConfig = require('../../../wallpapers.json');
const emojis = require('../../../emojis.json');

const getRarityEmoji = (rarity) => {
  switch (rarity.toLowerCase()) {
    case 'common':
      return emojis.wallpaperCommon;
    case 'uncommon':
      return emojis.wallpaperUncommon;
    case 'rare':
      return emojis.wallpaperRare;
    case 'epic':
      return emojis.wallpaperEpic;
    case 'legendary':
      return emojis.wallpaperLegendary;
    default:
      return '';
  }
};

module.exports = {
  name: "buywallpaper",
  aliases: ["bw"],
  description: "Buy a wallpaper for your profile",
  usage: "buywallpaper <wallpaper name>",
  run: async (client, message, args) => {
    const requestedWallpaper = args.join(" ");

    if (!requestedWallpaper) {
      return message.reply(`${emojis.wallpaperFrame} **Usage:** \`ep buywallpaper <wallpaper name>\`\nView available wallpapers with \`ep wallpapers\``);
    }

    const selectedWallpaper = wallpapersConfig.wallpapers.find(
      wallpaper => wallpaper.name.toLowerCase() === requestedWallpaper.toLowerCase()
    );

    if (!selectedWallpaper) {
      return message.reply(`${emojis.wallpaperFrame} Sorry, **${requestedWallpaper}** is not available.`);
    }

    try {
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply(`${emojis.level} **First use** \`ep start\` **to start your journey.**`);
      }

      // Check user balance
      if (user.balance < selectedWallpaper.price) {
        return message.reply(
          `${emojis.wallpaperFrame} You need **${selectedWallpaper.price.toLocaleString()} ${emojis.currencyEmoji}** to purchase this wallpaper. You only have **${user.balance.toLocaleString()} ${emojis.currencyEmoji}**.`
        );
      }

      // Check if user already owns the wallpaper
      const existingWallpaper = await Wallpaper.findOne({
        userId: message.author.id,
        wallpaperName: selectedWallpaper.name,
      });

      if (existingWallpaper) {
        return message.reply(
          `${emojis.wallpaperFrame} You already own **${selectedWallpaper.name}** ${getRarityEmoji(selectedWallpaper.rarity)}`
        );
      }

      // Create new wallpaper document
      const userWallpaper = new Wallpaper({
        userId: message.author.id,
        wallpaperName: selectedWallpaper.name,
        wallpaperLink: selectedWallpaper.link,
      });

      await userWallpaper.save();

      // Deduct price from user's balance
      user.balance -= selectedWallpaper.price;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle(`${emojis.wallpaperFrame} Wallpaper Purchased!`)
        .setDescription(
          `You've purchased **${selectedWallpaper.name}** ${getRarityEmoji(selectedWallpaper.rarity)}\n` +
          `Price: **${selectedWallpaper.price.toLocaleString()} ${emojis.currencyEmoji}**\n` +
          `Description: ${selectedWallpaper.description}`
        )
        .setImage(selectedWallpaper.link)
        .setFooter({ text: `Use 'ep setwallpaper ${selectedWallpaper.name}' to apply it` });

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Error occurred while processing the purchase:', err);
      return message.reply(`${emojis.maintenance} There was an issue purchasing the wallpaper.`);
    }
  },
};
