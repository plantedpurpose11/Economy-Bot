const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const Pocket = require("../../Schemas.js/PocketSchema");
const User = require("../../Schemas.js/userAccountCreation");
const Blacklist = require('../../Schemas.js/BlacklistSchema');
const emojis = require("../../../emojis.json");

async function isUserBlacklisted(userId) {
  const entry = await Blacklist.findOne({ userId });
  return entry !== null; // If entry exists, user is blacklisted
}

var timeout = [];
module.exports = {
  name: "shop",
  run: async (client, message, args) => {
    const isBlacklisted = await isUserBlacklisted(message.author.id);
    if (isBlacklisted) {
      return message.reply("You are blacklisted and cannot use this command.");
    }

    // Command cooldown check
    if (timeout.includes(message.author.id)) {
      const reply = await message.reply({
        content: "You are on a cooldown. Please wait 7 seconds!",
        ephemeral: true,
      });

      // Delete the cooldown message after 2 seconds
      setTimeout(() => {
        reply.delete().catch(console.error);
      }, 2000);

      return;
    }

    // Apply cooldown
    timeout.push(message.author.id);
    setTimeout(() => {
      timeout.shift();
    }, 7000);
    try {
      const userAccount = await User.findOne({ userId: message.author.id });
      let user = await Pocket.findOne({ userId: message.author.id });

      if (!userAccount) {
        return message.reply(":ribbon: **First use** `ep start` **to start your journey.**");
      }

      if (!user) {
        const newUser = new Pocket({
          userId: message.author.id,
          items: [],
        });
        user = await newUser.save();
        return message.reply("Your pocket has been created! `ep shop`");
      }

      const coins = userAccount.balance;

      const shopItems = [
        {
          name: "Hunters Food",
          emoji: emojis.huntersFood,
          price: 1000,
          quantity: -1,
          buttonText: "Food",
        },
        {
          name: "Carrot_Seeds",
          emoji: emojis.carrotSeeds,
          price: 800,
          quantity: -1,
          buttonText: "Carrot",
        },
        {
          name: "Potato_Seeds",
          emoji: emojis.potatoSeeds,
          price: 700,
          quantity: -1,
          buttonText: "Potato",
        },
        {
          name: "Rice_Seeds",
          emoji: emojis.riceSeeds,
          price: 600,
          quantity: -1,
          buttonText: "Rice",
        },
      ];

      const itemsEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Shop")
        .setDescription("Welcome to the shop! Choose an item to buy.");

      for (const item of shopItems) {
        itemsEmbed.addFields({
          name: `${item.name} ${item.emoji}`,
          value: `Price: **${item.price}** EP ${emojis.currencyEmoji} Coins.`,
        });
      }

      const row = new ActionRowBuilder();

      for (let i = 0; i < shopItems.length; i++) {
        const buyButton = new ButtonBuilder()
          .setCustomId(`buy_item_${i}`)
          .setLabel(shopItems[i].buttonText)
          .setStyle(ButtonStyle.Success);

        row.addComponents(buyButton);
      }

      const itemsMsg = await message.reply({
        embeds: [itemsEmbed],
        components: [row],
      });

      const filter = (interaction) => interaction.user.id === message.author.id;
      const collector = itemsMsg.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (interaction) => {
        const itemIndex = parseInt(interaction.customId.split("_")[2]);
        const selectedItem = shopItems[itemIndex];

        // Check if the user has enough coins to purchase the item
        if (coins < selectedItem.price) {
          await interaction.reply({
            content: "You don't have enough coins to purchase this item.",
            ephemeral: true,
          });
          return;
        }

        // Check if the item exists in the user's pocket and has enough quantity
        const pocketItemIndex = user.items.findIndex(
          (item) => item.name === selectedItem.name
        );

        if (
          pocketItemIndex !== -1 &&
          user.items[pocketItemIndex].quantity >= 100 &&
          selectedItem.name === "Hunters Food"
        ) {
          await interaction.reply({
            content: "You already have enough food in your pocket.",
            ephemeral: true,
          });
          return;
        }

        if (
          pocketItemIndex !== -1 &&
          user.items[pocketItemIndex].quantity >= 40 &&
          (selectedItem.name === "Carrot_Seeds" ||
            selectedItem.name === "Potato_Seeds" ||
            selectedItem.name === "Rice_Seeds")
        ) {
          await interaction.reply({
            content: `You already have enough ${selectedItem.name} in your pocket.`,
            ephemeral: true,
          });
          return;
        }

        // Reduce the quantity of the selected item in the shop

        // Define the quantity to add for different items
        let quantityToAdd = 0; // Default

        if (selectedItem.name === "Hunters Food") {
          quantityToAdd = 10;
        } else if (
          selectedItem.name === "Carrot_Seeds" ||
          selectedItem.name === "Potato_Seeds" ||
          selectedItem.name === "Rice_Seeds"
        ) {
          quantityToAdd = 10;
        }

        // Check if the user has enough balance after deducting the item price
        if (userAccount.balance < selectedItem.price) {
          await interaction.reply({
            content: "You don't have enough coins to purchase this item.",
            ephemeral: true,
          });
          return;
        }

        // Find the item in the user's pocket or add it if not present
        if (pocketItemIndex !== -1) {
          // Update the quantity if the item exists in the pocket
          user.items[pocketItemIndex].quantity += quantityToAdd;
        } else {
          // Add the item to the user's pocket
          user.items.push({
            name: selectedItem.name,
            emoji: selectedItem.emoji,
            price: selectedItem.price,
            quantity: quantityToAdd,
          });
        }

        // Deduct the item price from the user's balance
        userAccount.balance -= selectedItem.price;

        // Save changes to the user's pocket and account
        await user.save();
        await userAccount.save();

        await interaction.reply({
          content: `You have purchased x10 ${selectedItem.name} for **__${selectedItem.price}__** coins.`,
          ephemeral: true,
        });
      });

      collector.on("end", async () => {
        const disabledRow = new ActionRowBuilder();
        for (let i = 0; i < shopItems.length; i++) {
          const disabledButton = new ButtonBuilder()
            .setCustomId(`buy_item_${i}`)
            .setLabel(shopItems[i].buttonText)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true); // Disable the button

          disabledRow.addComponents(disabledButton);
        }

        // Edit the message to update the disabled buttons
        await itemsMsg.edit({
          embeds: [itemsEmbed],
          components: [disabledRow],
        });
      });

      return;

      return;
    } catch (err) {
      console.error("Error:", err);
      return message.reply("An error occurred while processing the purchase.");
    }
  },
};
