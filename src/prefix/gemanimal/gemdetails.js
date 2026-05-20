const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const PremiumAnimal = require("../../Schemas.js/PremiumAnimalSchema");
const TradePremium = new Map();

module.exports = {
  name: "detailsgem",
  aliases: ["dg"],
  run: async (client, message, args) => {
    
    try {
      const animalName = args[0];

      if (!animalName) {
        return message.reply("Please provide the name of the premium animal.");
      }

      const userId = message.author.id;
      const userAnimals = await PremiumAnimal.find({
        userId,
        name: { $regex: new RegExp(`^${animalName}$`, "i") },
      });

      if (!userAnimals || userAnimals.length === 0) {
        return message.reply("You do not own this gem animal.");
      }
    TradePremium.set(userId, true);

      //   const animalOptions = userAnimals.map(animal => ({
      //     label: `Level: ${animal.level} | Attack: ${animal.attack} | Health: ${animal.health}`,
      //     value: animal._id,
      //   }));

      const selectMenuOptions = userAnimals.map((animal) => {
        return new StringSelectMenuOptionBuilder()
          .setLabel(
            `Level: ${animal.level} | Attack: ${animal.attack} | Health: ${animal.health}`
          )
          .setValue(animal._id.toString());
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("premium_animals")
        .setPlaceholder("Select an animal")
        .addOptions(selectMenuOptions);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const selectionMessage = await message.reply({
        content: "Please select the animal you want to view details for:",
        components: [row],
        fetchReply: true,
      });

      const selectionCollector =
        message.channel.createMessageComponentCollector({
          componentType: 3,
          time: 15000,
        });

      selectionCollector.on("collect", async (interaction) => {
        if (
          interaction.isStringSelectMenu() &&
          interaction.customId === "premium_animals"
        ) {
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
          const selectedAnimalId = interaction.values[0];
          const selectedAnimal = await PremiumAnimal.findById(selectedAnimalId);

          const embed = new EmbedBuilder()
            .setColor("#ffffff")
            .setAuthor({
              name: `Gem Animal: ${selectedAnimal.name}`,
              iconURL:
                "https://cdn.discordapp.com/attachments/1177280453581996123/1195250488208277534/OIP_32-transformed.png",
            })
            .setTitle(
              `Details of ${selectedAnimal.name} - Level ${selectedAnimal.level}`
            )
            .setDescription(
              `<:card:1195253091528876074> **XP:** ${selectedAnimal.xp}\n<:card:1195253091528876074> **Level:** ${selectedAnimal.level}\n<:card:1195253091528876074> **Attack:** ${selectedAnimal.attack}\n<:card:1195253091528876074> **Health:** ${selectedAnimal.health}`
            )
            .setThumbnail(selectedAnimal.image);

          await interaction.update({ embeds: [embed] });
        }
      });

      selectionCollector.on("end", async () => {
        TradePremium.delete(userId)

        await selectionMessage.edit({ components: [] });
      });
    } catch (error) {
      console.error("Error:", error);
      return message.reply("An error occurred while fetching animal details.");
    }
  },
};
