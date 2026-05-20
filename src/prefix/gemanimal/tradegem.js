const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonStyle,
} = require("discord.js");
const PremiumAnimal = require("../../Schemas.js/PremiumAnimalSchema");
const User = require("../../Schemas.js/userAccountCreation");
const TradePremium = new Map();

module.exports = {
  name: "tradegem",
  run: async (client, message, args) => {
    if (args.length !== 3) {
      return message.reply(
        "Please use the format: tradegem <mention> <animal> <coins>"
      );
    }

    const mentionedUser = message.mentions.users.first();
    const animalName = args[1].toLowerCase();
    const coins = parseInt(args[2]);

    if (!mentionedUser) {
      return message.reply("Please mention a valid user to trade with.");
    }

    const mentionedUserDoc = await User.findOne({ userId: mentionedUser.id });

    if (!mentionedUserDoc || mentionedUserDoc.balance < coins) {
      return message.reply(
        "The mentioned user does not have enough coins for this trade."
      );
    }
    const userId = message.author.id;
    TradePremium.set(userId, true);


    const userAnimals = await PremiumAnimal.find({
      userId,
      name: { $regex: new RegExp(`^${animalName}$`, "i") },
    });

    const selectedAnimal = userAnimals.find(
      (animal) => animal.name.toLowerCase() === animalName
    );

    if (!selectedAnimal || selectedAnimal.length === 0) {
      return message.reply(
        "You do not have enough of this premium animal to trade."
      );
    }

    const animalsOwnedByUser = userAnimals.map((animal) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(
          `Level: ${animal.level} | Attack: ${animal.attack} | Health: ${animal.health}`
        )
        .setValue(animal._id.toString());
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("animalSelection")
      .setPlaceholder("Select an animal to trade")
      .addOptions(animalsOwnedByUser);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const selectionMessage = await message.reply({
      content: "Please select the animal you want to view details for:",
      components: [row],
      fetchReply: true,
    });

    const collector = message.channel.createMessageComponentCollector({
      componentType: 3,
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      const { user } = interaction;
      const userId = user.id;
      const customIdSelect3 = TradePremium.get(userId);
      if (customIdSelect3 !== true) {
        await message.reply({
          content: `${user} This select menu is only for the original user.`,
          ephemeral: true,
        });
        return;
      }
      const selectedAnimal = await PremiumAnimal.findById(
        interaction.values[0]
      );

      if (!selectedAnimal) {
        return;
      }

      const embed = new EmbedBuilder()
        // .setTitle(`${selectedAnimal.name} Details`)
        .setColor('#ffffff')
        .setAuthor({ name: `Animal Name: ${selectedAnimal.name}`, iconURL: "https://cdn.discordapp.com/attachments/1177280453581996123/1195250488208277534/OIP_32-transformed.png"})
        .setDescription(
          `<:white_star:1195251137662685227> <a:white_arrow:1195252408792662136>**Level:** ${selectedAnimal.level}\n<:white_star:1195251137662685227> <a:white_arrow:1195252408792662136> **Attack:** ${selectedAnimal.attack}\n<:white_star:1195251137662685227>  <a:white_arrow:1195252408792662136>**Health:** ${selectedAnimal.health}\n<:white_star:1195251137662685227> <a:white_arrow:1195252408792662136> **Emoji:** ${selectedAnimal.emoji}`
        )
        .setThumbnail(selectedAnimal.image);

      const acceptButton = new ButtonBuilder()
        .setCustomId("acceptTrade")
        .setLabel("Accept Trade")
        .setStyle(ButtonStyle.Primary);

      const newMessage = await interaction.channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(acceptButton)],
      });

      collector.stop("tradeDetailsSent");

      const filter = (responseInteraction) => {
        return (
          responseInteraction.user.id === mentionedUser.id &&
          responseInteraction.customId === "acceptTrade"
        );
      };

      const responseCollector =
        interaction.channel.createMessageComponentCollector({
          filter,
          time: 15000,
        });

      responseCollector.on("collect", async () => {
        const initiatingUserAnimals = await PremiumAnimal.find({
          userId: message.author.id,
          name: selectedAnimal.name,
        });

        if (initiatingUserAnimals.length === 0) {
          return message.reply("You don't have this gemmate animal to trade.");
        }

        // Assuming trade logic here involves swapping animals between users
        // Update the initiating user's animal data
        const initiatingUserAnimal = initiatingUserAnimals[0]; // Assuming there's only one
        initiatingUserAnimal.userId = mentionedUser.id; // Change the owner of the animal
        await initiatingUserAnimal.save();

        // Update the mentioned user's animal data
        selectedAnimal.userId = message.author.id; // Change the owner of the traded animal
        await selectedAnimal.save();

        // Update the balances for both users
        mentionedUserDoc.balance -= coins;
        await mentionedUserDoc.save();

        const initiatingUserDoc = await User.findOne({
          userId: message.author.id,
        });
        initiatingUserDoc.balance += coins;
        await initiatingUserDoc.save();

        collector.stop("tradeAccepted");
        responseCollector.stop();
        newMessage.edit({
          components: [], // Remove the button
        });
        message.channel.send(
          `Trade successfully executed between ${message.author} and ${mentionedUser}.`
        );
      });

      responseCollector.on("end", () => {
        if (!collector.ended) {
          newMessage.edit({
            components: [], // Remove the button
          });
          return;
        }
      });
    });

    collector.on("end", (collected, reason) => {
      if (reason !== "tradeDetailsSent") {
        TradePremium.delete(userId)
        return;
      }
    });
  },
};
