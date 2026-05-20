const { EmbedBuilder } = require("discord.js");
const wallpapersConfig = require('../../../wallpapers.json');
const emojis = require('../../../emojis.json');
const Wallpaper = require('../../Schemas.js/wallpaperSchema');
const User = require('../../Schemas.js/userAccountCreation');

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
  name: "mywallpapers",
  aliases: ["mw", "mywall"],
  description: "View your owned wallpapers",
  usage: "mywallpapers",
  run: async (client, message, args) => {
    try {
      // Check if user has an account
      const user = await User.findOne({ userId: message.author.id });
      if (!user) {
        return message.reply(`${emojis.level} **First use** \`ep start\` **to start your journey.**`);
      }

      // Get user's wallpapers
      const userWallpapers = await Wallpaper.find({ userId: message.author.id });

      if (!userWallpapers || userWallpapers.length === 0) {
        return message.reply(
          `${emojis.wallpaperFrame} You don't own any wallpapers yet! Use \`ep wallpapers\` to browse available wallpapers.`
        );
      }

      // Group wallpapers by rarity
      const rarityGroups = {
        legendary: [],
        epic: [],
        rare: [],
        uncommon: [],
        common: []
      };

      // Get currently active wallpaper
      const activeWallpaper = userWallpapers.find(w => w.setWallpaper);

      // Process each wallpaper
      userWallpapers.forEach(userWallpaper => {
        const wallpaperConfig = wallpapersConfig.wallpapers.find(
          w => w.name === userWallpaper.wallpaperName
        );

        if (wallpaperConfig) {
          const isActive = userWallpaper.setWallpaper;
          const rarityEmoji = getRarityEmoji(wallpaperConfig.rarity);
          const displayName = `${rarityEmoji} **${wallpaperConfig.name}** ${isActive ? '(Active)' : ''}`;
          
          rarityGroups[wallpaperConfig.rarity.toLowerCase()].push(displayName);
        }
      });

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle(`${emojis.wallpaperFrame} Your Wallpapers`)
        .setDescription(
          `You own **${userWallpapers.length}** wallpaper${userWallpapers.length !== 1 ? 's' : ''}\n` +
          `Currently active: **${activeWallpaper ? activeWallpaper.wallpaperName : 'None'}**`
        );

      // Add each non-empty rarity group to the embed
      if (rarityGroups.legendary.length > 0) {
        embed.addFields({ name: "🌟 Legendary", value: rarityGroups.legendary.join("\n") });
      }
      if (rarityGroups.epic.length > 0) {
        embed.addFields({ name: "✨ Epic", value: rarityGroups.epic.join("\n") });
      }
      if (rarityGroups.rare.length > 0) {
        embed.addFields({ name: "💫 Rare", value: rarityGroups.rare.join("\n") });
      }
      if (rarityGroups.uncommon.length > 0) {
        embed.addFields({ name: "🌠 Uncommon", value: rarityGroups.uncommon.join("\n") });
      }
      if (rarityGroups.common.length > 0) {
        embed.addFields({ name: "⭐ Common", value: rarityGroups.common.join("\n") });
      }

      // Add footer with instructions
      embed.setFooter({ 
        text: "Use 'ep setwallpaper <name>' to set a wallpaper as active | 'ep wallpapers' to view available wallpapers" 
      });

      // If user has an active wallpaper, show it as thumbnail
      if (activeWallpaper) {
        const activeConfig = wallpapersConfig.wallpapers.find(
          w => w.name === activeWallpaper.wallpaperName
        );
        if (activeConfig) {
          embed.setThumbnail(activeConfig.link);
        }
      }

      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('Error:', err);
      return message.reply(`${emojis.maintenance} An error occurred while fetching your wallpapers.`);
    }
  },
};
