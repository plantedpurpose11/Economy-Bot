const { MessageActionRow, MessageButton, MessageEmbed, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

const adminIDs = config.adminIds;
module.exports = {
    name: 'serverleave',
    description: 'Leave a server based on server ID',
    adminOnly: true, 
  
    run: async (client, message, args) => {
      if (!adminIDs.includes(message.author.id)) {
        return message.reply('Only administrators can use this command.');
      }
  
      const serverID = args[0];
      if (!serverID) return message.reply('Please provide a server ID.');
  
      try {
        const guild = client.guilds.cache.get(serverID);
        if (!guild) return message.reply('I am not in that server.');
  
        await guild.leave();
        return message.reply(`Successfully left the server with ID ${serverID}.`);
      } catch (err) {
        console.error('Error:', err);
        return message.reply('An error occurred while leaving the server.');
      }
    },
  };
  