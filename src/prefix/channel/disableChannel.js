const { PermissionsBitField } = require('discord.js');
const ChannelsDisable = require('../../Schemas.js/channelDisable');

module.exports = {
    name: 'disable',
    description: 'Disable the current channel for bot commands.',
    run: async (client, message, args) => {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return;
      }
  
      try {
        const channelID = message.channel.id;
  
        // Check if the channel is already disabled
        const existingChannel = await ChannelsDisable.findOne({ channelId: channelID });
        if (existingChannel) {
          return message.reply('This channel is already disabled.');
        }
  
        // Add the channel to the channelsDisable schema
        await ChannelsDisable.create({ channelId: channelID });
        message.reply('This channel has been disabled for **EcoPaL** commands.');
      } catch (error) {
        console.error(error);
        message.reply('There was an error disabling this channel.');
      }
    },
  };