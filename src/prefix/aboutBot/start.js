const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Embed,
} = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation"); // Assuming your schema is in a 'models' folder
const config = require('../../../config.json')
const emojis = require('../../../emojis.json')

var timeout = [];

const Blacklist = require("../../Schemas.js/BlacklistSchema");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

module.exports = {
  name: "start",
  description: "Create a user account and earn EP coins",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    //command cooldown top
    if (timeout.includes(message.author.id))
      return await message.reply({
        content: "You are on a cooldown. wait 10 seconds!",
        ephemeral: true,
      });

    //command cooldown
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 10000);

    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ userId: message.author.id });

      if (existingUser) {
        return message.reply("You already have an account!");
      }

      const botInviteLink = config.botInviteLink;

      const termsEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Terms and Services")
        .setDescription(
          "**Rules and Guidelines**\nWelcome to EcoPal Bot's Journey. Here are the guidelines we expect you to follow:\n\n" +
            "1. Respect others and their belongings. Any attempt to scam or deceive others using trade commands will result in a complete reset of your balance and inventory.\n" +
            "2. Usage of scripts or any form of automation to exploit the bot functionalities is strictly prohibited. Engaging in such activities will lead to a permanent blacklist.\n" +
            "3. Avoid spamming commands. Repeatedly using commands excessively or inappropriately will result in a complete balance reset. Continued violations will result in a blacklist.\n" +
            "4. Use appropriate language and behavior. Any form of hate speech, harassment, or inappropriate behavior is not tolerated.\n" +
            "5. Do not share personal information or attempt to collect others' personal information.\n" +
            "6. Abide by the Discord Terms of Service and Community Guidelines at all times.\n" +
            "7. Respect the staff and their decisions. Any argument or disrespect towards staff will result in appropriate action.\n" +
            "8. Do not advertise or promote external servers, products, or services without permission.\n" +
            "9. Refrain from creating multiple accounts to exploit the bot's features.\n" +
            `10. If you have any questions or concerns, feel free to join our [Support Server](${botInviteLink}) and ask for assistance.`
        );

      const acceptButton = new ButtonBuilder()
        .setCustomId("accept_terms")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(acceptButton);

      const termsMessage = await message.channel.send({
        embeds: [termsEmbed],
        components: [row],
      });

      const filter = (i) =>
        i.customId === "accept_terms" && i.user.id === message.author.id;
      const collector = termsMessage.createMessageComponentCollector({
        filter,
        time: 10000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          interaction.followUp("This is not your message!");
          return;
        }

        // Disable the button after the user accepts terms
        acceptButton.setDisabled(true);
        // termsMessage.edit({ embeds: [termsEmbed], components: [new ActionRowBuilder().addComponents(acceptButton.setDisabled(true))] });
        termsMessage.edit({ embeds: [termsEmbed], components: [] });

        // Give 1000 EP coins to the user after accepting terms
        const newUser = new User({
          userId: message.author.id,
          userName: message.author.username,
          balance: 1000, // Initial balance
        });
        await newUser.save();

        const successMessage = `${emojis.flower} Your account has been created with **1000** ${emojis.currencyEmoji} EP coins.`;
        message.reply(successMessage);
        collector.stop(); // Stop the collector once the terms are accepted
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          acceptButton.setDisabled(true);
          termsMessage.edit({
            embeds: [termsEmbed],
            components: [
              new ActionRowBuilder().addComponents(
                acceptButton.setDisabled(true)
              ),
            ],
          });
          message.reply("You did not accept the terms within the given time.");
        }
      });
    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while creating your account.");
    }
  },
};
