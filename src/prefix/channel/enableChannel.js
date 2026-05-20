const { PermissionsBitField } = require("discord.js");
const ChannelsDisable = require("../../Schemas.js/channelDisable");

// Command to enable a channel
module.exports = {
  name: "enable",
  description: "Enable bot commands in the current channel.",
  run: async(client, message, args) => {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      return;
    }
    try {
      const channelID = message.channel.id;
      // Check if the channel is disabled
      const disabledChannel = await ChannelsDisable.findOne({
        channelId: channelID,
      });
      if (!disabledChannel) {
        return message.reply(
          "**EcoPaL** commands are already enabled in this channel."
        );
      }

      // Remove the channel from the channelsDisable schema
      await ChannelsDisable.findOneAndDelete({ channelId: channelID });
      message.reply("**EcoPaL** commands have been enabled in this channel.");
    } catch (error) {
      console.error(error);
      message.reply(
        "There was an error enabling bot commands in this channel."
      );
    }
  },
};
