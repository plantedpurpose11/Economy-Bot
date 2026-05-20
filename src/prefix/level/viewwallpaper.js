const { EmbedBuilder } = require("discord.js");
const wallpapersConfig = require('../../../wallpapers.json');
const emojis = require('../../../emojis.json');
const Wallpaper = require('../../Schemas.js/wallpaperSchema');

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
  name: "wallpapers",
  aliases: ["vw", "wallpaper"],
  description: "View available wallpapers or details of a specific wallpaper",
  usage: "wallpapers [wallpaper name]",
  run: async (client, message, args) => {
    const requestedWallpaperName = args.join(" ");

    // If no specific wallpaper is requested, show all wallpapers
    if (!requestedWallpaperName) {
      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle(`${emojis.wallpaperFrame} Available Wallpapers`)
        .setDescription("Here are all available wallpapers grouped by rarity:");

      // Group wallpapers by rarity
      const rarityGroups = {
        legendary: [],
        epic: [],
        rare: [],
        uncommon: [],
        common: []
      };

      wallpapersConfig.wallpapers.forEach(wallpaper => {
        const rarityEmoji = getRarityEmoji(wallpaper.rarity);
        rarityGroups[wallpaper.rarity.toLowerCase()].push(
          `${rarityEmoji} **${wallpaper.name}** - ${wallpaper.price.toLocaleString()} ${emojis.currencyEmoji}`
        );
      });

      // Add each rarity group to the embed
      if (rarityGroups.legendary.length > 0) {
        embed.addFields({ name: "🌟 Legendary Wallpapers", value: rarityGroups.legendary.join("\n") });
      }
      if (rarityGroups.epic.length > 0) {
        embed.addFields({ name: "✨ Epic Wallpapers", value: rarityGroups.epic.join("\n") });
      }
      if (rarityGroups.rare.length > 0) {
        embed.addFields({ name: "💫 Rare Wallpapers", value: rarityGroups.rare.join("\n") });
      }
      if (rarityGroups.uncommon.length > 0) {
        embed.addFields({ name: "🌠 Uncommon Wallpapers", value: rarityGroups.uncommon.join("\n") });
      }
      if (rarityGroups.common.length > 0) {
        embed.addFields({ name: "⭐ Common Wallpapers", value: rarityGroups.common.join("\n") });
      }

      embed.setFooter({ text: "Use 'ep wallpapers <name>' to view a specific wallpaper" });
      return message.reply({ embeds: [embed] });
    }

    // If a specific wallpaper is requested
    const selectedWallpaper = wallpapersConfig.wallpapers.find(
      wallpaper => wallpaper.name.toLowerCase() === requestedWallpaperName.toLowerCase()
    );

    if (!selectedWallpaper) {
      return message.reply(`${emojis.wallpaperFrame} Sorry, **${requestedWallpaperName}** was not found.`);
    }

    // Check if user owns this wallpaper
    const userOwnsWallpaper = await Wallpaper.findOne({
      userId: message.author.id,
      wallpaperName: selectedWallpaper.name
    });

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setTitle(`${emojis.wallpaperFrame} ${selectedWallpaper.name} ${getRarityEmoji(selectedWallpaper.rarity)}`)
      .setDescription(
        `${selectedWallpaper.description}\n\n` +
        `**Price:** ${selectedWallpaper.price.toLocaleString()} ${emojis.currencyEmoji}\n` +
        `**Rarity:** ${selectedWallpaper.rarity}\n` +
        `**Status:** ${userOwnsWallpaper ? "✅ Owned" : "❌ Not Owned"}`
      )
      .setImage(selectedWallpaper.link);

    if (!userOwnsWallpaper) {
      embed.setFooter({ text: "Use 'ep buywallpaper <name>' to purchase this wallpaper" });
    } else {
      embed.setFooter({ text: "Use 'ep setwallpaper <name>' to set this as your profile wallpaper" });
    }

    return message.reply({ embeds: [embed] });
  },
};
