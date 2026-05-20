const {
  Events,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const config = require('../../config.json');
const emojiConfig = require('../../emojis.json');

module.exports = {
  name: Events.MessageCreate,

  async execute(message, client, interaction) {
    if (message.author.bot) return;
    const clientId = config.clientId;
    if (message.content.startsWith(`<@${clientId}>`)) {

      const botinviteLink = config.botInviteLink;
      const linkEmoji = emojiConfig.linkEmoji;
      const supportEmoji = emojiConfig.supportEmoji;

      const pingEmbed = new EmbedBuilder()

        .setColor("#00c7fe")
        .setTitle("Who mentioned me??")
        .setDescription(
          `Hey there **${message.author.username}**!, here is some useful information about me.\n⁉️ • **How to view all commands?**\nDo **ep help** to view a list of all the commands!`
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${message.author.username}.` })
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setEmoji(linkEmoji)
            .setLabel("Invite Me")
            .setURL(
              botinviteLink
            )
            .setStyle(ButtonStyle.Link),

          new ButtonBuilder()
            .setEmoji(supportEmoji)
            .setLabel("Support Server")
            .setURL(
              botinviteLink
            )
            .setStyle(ButtonStyle.Link)


        );

      return message.reply({ embeds: [pingEmbed], components: [buttons] });


    }
  },
};
