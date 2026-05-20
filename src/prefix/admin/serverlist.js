const { MessageActionRow, MessageButton, MessageEmbed, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

const adminIDs = config.adminIds;
const pageSize = 10;

module.exports = {
  name: 'serverlist',
  description: 'Display list of servers and their member count',

  run: async (client, message, args) => {
    if (!adminIDs.includes(message.author.id)) {
      return message.reply('Only administrators can use this command.');
    }

    try {
      const guilds = Array.from(client.guilds.cache.values());
      const totalPages = Math.ceil(guilds.length / pageSize);
      let page = 0;

      const generateEmbed = (page) => {
        const serverListEmbed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('Server List')
          .setDescription(`Page ${page + 1} of ${totalPages}`);

        const start = page * pageSize;
        const end = start + pageSize;
        const servers = guilds.slice(start, end);

        servers.forEach((guild) => {
          serverListEmbed.addFields({name:guild.name,  value:`Server ID: ${guild.id}\nMembers: ${guild.memberCount}`});
        });

        return serverListEmbed;
      };

      const msg = await message.channel.send({ embeds: [generateEmbed(page)] });
      if (totalPages <= 1) return;

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('prevPage')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('nextPage')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Primary)
        );

      await msg.edit({ embeds: [generateEmbed(page)], components: [row] });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'prevPage' && page > 0) {
          page--;
        } else if (interaction.customId === 'nextPage' && page < totalPages - 1) {
          page++;
        }

        await interaction.update({ embeds: [generateEmbed(page)] });
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch(console.error);
      });
    } catch (err) {
      console.error('Error:', err);
      return message.reply('An error occurred while fetching server information.');
    }
  },
};
