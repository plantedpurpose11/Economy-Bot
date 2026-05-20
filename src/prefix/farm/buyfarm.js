// Command - farm.js
const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const User = require("../../Schemas.js/userAccountCreation");
const Farm = require("../../Schemas.js/farmSchema");
const emojis = require("../../../emojis.json");

module.exports = {
  name: "buyfarm",
  aliases: ['bf'],
  run: async (client, message, args) => {
    try {
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        await message.reply({
          content: ":ribbon: **First use** `ep start` **to start your journey.**",
        });
        return;
      }

      const userBalance = user.balance || 0; // Retrieve user's balance

      const farms = [
        {
          name: "Small Farm",
          price: 10000,
          seeds: 10,
        },
        {
          name: "Medium Farm",
          price: 45000,
          seeds: 20,
        },
        {
          name: "Large Farm",
          price: 75000,
          seeds: 40,
        },
      ];

      // Create buttons and action row
      const farmButtons = farms.map((farm, index) => {
        return new ButtonBuilder()
          .setCustomId(`buy_farm_${index}`)
          .setLabel(`${farm.name}`)
          .setStyle(ButtonStyle.Primary);
      });

      const row = new ActionRowBuilder().addComponents(farmButtons);

      // Create embed
      const farmEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Available Farms")
        .setDescription("Choose a farm to purchase:")
        .addFields(
          {
            name: "Small Farm",
            value:
              `10 Seeds Capacity - 10,000 ${emojis.currencyEmoji} EP Coins`,
          },
          {
            name: "Medium Farm",
            value:
              `20 Seeds Capacity - 45,000 ${emojis.currencyEmoji} EP Coins`,
          },
          {
            name: "Large Farm",
            value:
              `40 Seeds Capacity - 75,000 ${emojis.currencyEmoji} EP Coins`,
          }
        );

      // Send the message with the embed and buttons
      const itemsMsg = await message.reply({
        embeds: [farmEmbed],
        components: [row],
      });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = itemsMsg.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (interaction) => {
        try {
          const selectedFarmIndex = parseInt(
            interaction.customId.split("_")[2]
          );
          const selectedFarm = farms[selectedFarmIndex];

          if (userBalance < selectedFarm.price) {
            await interaction.reply({
              content: "You don't have enough coins to purchase this farm.",
              ephemeral: true,
            });
            return;
          }

          const userFarm = await Farm.findOne({ userId: message.author.id });
          if (userFarm) {
            await interaction.reply({
              content:
                "You already have a farm. You can't purchase another one.",
              ephemeral: true,
            });
            return;
          }

          const newFarm = new Farm({
            userId: message.author.id,
            farmType: selectedFarm.name,
            seedCapacity: selectedFarm.seeds,
          });

          await newFarm.save();

          user.balance -= selectedFarm.price;
          await user.save();

          await interaction.reply({
            content: `You have purchased **${selectedFarm.name}**.`,
            ephemeral: true,
          });
        } catch (err) {
          console.error("Error:", err);
          await interaction.reply({
            content: "An error occurred while processing your request.",
            ephemeral: true,
          });
        }
      });
      // Disable buttons after 10 seconds
      setTimeout(() => {
        // Map through the components and set them to disabled
        const disabledComponents = farmButtons.map((button) =>
          button.setDisabled(true)
        );

        // Update the row components with the disabled buttons
        itemsMsg
          .edit({
            components: [
              new ActionRowBuilder().addComponents(disabledComponents),
            ],
          })
          .catch(console.error);

        collector.stop(); // Stop the collector
      }, 10000); // 10 seconds in milliseconds
    } catch (err) {
      console.error("Error:", err);
      message.reply("An error occurred while processing.");
    }
  },
};
