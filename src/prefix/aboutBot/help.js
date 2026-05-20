const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
} = require("discord.js");
const Blacklist = require("../../Schemas.js/BlacklistSchema");
const emojis = require("../../../emojis.json");
const config = require("../../../config.json");

// Function to check if a user is blacklisted
async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}
const timeout = [];
module.exports = {
  name: "help",
  description: "This is the help command.",

  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }
    //command cooldown top
    if (timeout.includes(message.author.id))
      return await message.reply({
        content: "You are on a cooldown. wait 7 seconds!",
        ephemeral: true,
      });

    //command cooldown

    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 7000);
    const user = message.author.username;
    const icon = message.author.displayAvatarURL();

    // const tag = message.author.tag;

    const hmenu = new EmbedBuilder()
      .setColor("#00c7fe")
      .setDescription(
        `**${config.botName}** is a Discord Bot that offers various features to enhance your server experience. So invite the bot to your server and enhance your server experience with **${config.botName}**.`
      )
      .addFields(
        {
          name: ":notebook: : __Economy__",
          value: `- ${emojis.farming} : Farming
          - ${emojis.trading} : Trading
          - ${emojis.investment} : Investment
          - ${emojis.bank} : Bank
          - ${emojis.gembling} : Gamble`,
          inline: false
        },
        {
          name: ":green_book: : __Activities__",
          value: `- ${emojis.hunters} : Hunters
          - ${emojis.jungle} : Jungle
          - ${emojis.action} : Action
          - ${emojis.fight} : Fight`,
          inline: false
        },
        {
          name: ":orange_book: : __Utilities__",
          value: `- ${emojis.level} : Level
          - ${emojis.shop} : Shop
          - ${emojis.give} : Give
          - ${emojis.gem} : Gems`,
          inline: false
        }
      )
      .setThumbnail(`${icon}`)
      .setImage(
        "https://cdn.discordapp.com/attachments/1177280453581996123/1183019760414363688/20231209_120148.jpg"
      )
      .setTimestamp();

    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(`Back`)
        .setCustomId(`bth`)
        .setStyle(ButtonStyle.Danger)
    );
    const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(`Support Server`)
        .setURL(config.supportServer)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel(`Invite Bot`)
        .setURL(config.botInviteLink)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel(`Vote`)
        .setURL(config.topggVoteLink)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel(`Website`)
        .setURL(config.websiteLink)
        .setStyle(ButtonStyle.Link)
    );

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Select Category")
        .addOptions(
          {
            label: "Main Menu",
            description: "Shows you main menu",
            emoji: emojis.maintenance,
            value: `hmenu`,
          },
          {
            label: "Farming",
            description: "Shows you farming commamds",
            emoji: emojis.farming,
            value: `farming`,
          },
          {
            label: "Trading",
            description: "Shows you Trading commands",
            emoji: emojis.trading,
            value: `trading`,
          },
          {
            label: "Hunters",
            description: "Shows you Hunters commands",
            emoji: emojis.hunters,
            value: `hunters`,
          },
          {
            label: "Investment",
            description: "Shows you investment commamds",
            emoji: emojis.investment,
            value: `investment`,
          },
          {
            label: "Jungle",
            description: "Shows you jungle commamds",
            emoji: emojis.jungle,
            value: `jungle`,
          },
          {
            label: "Level",
            description: "Shows you Level commands",
            emoji: emojis.level,
            value: `level`,
          },
          {
            label: "Shop",
            description: "Shows you Shop commands",
            emoji: emojis.shop,
            value: `shop`,
          },
          {
            label: "Action",
            description: "Shows you Action commands",
            emoji: emojis.action,
            value: `action`,
          },
          {
            label: "Give",
            description: "Shows you give commands",
            emoji: emojis.give,
            value: `give`,
          },
          {
            label: "Fight",
            description: "Shows you fight commands",
            emoji: emojis.fight,
            value: `fight`,
          },
          {
            label: "Bank",
            description: "Shows you bank commands",
            emoji: emojis.bank,
            value: `bank`,
          },
          {
            label: "Gems",
            description: "Shows you gems commands",
            emoji: emojis.gem,
            value: `gems`,
          },
          {
            label: "Gamble",
            description: "Shows you gamble commands",
            emoji: emojis.gembling,
            value: `gamble`,
          }
        )
    );
    await message.reply({ embeds: [hmenu], components: [menu, btns] });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;

      const user = interaction.user;
      const icon = user.displayAvatarURL();
      const tag = user.tag;

      const bth = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(`Back`)
          .setCustomId(`bth`)
          .setStyle(ButtonStyle.Danger)
      );
      const btns = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(`Support Server`)
          .setURL(config.supportServer)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel(`Invite Bot`)
          .setURL(config.botInviteLink)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel(`Vote`)
          .setURL(config.topggVoteLink)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel(`Website`)
          .setURL(config.websiteLink)
          .setStyle(ButtonStyle.Link)
      );

      if (!interaction.isButton()) return;
    });
  },
};
